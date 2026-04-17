import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData = require('form-data');

const DIDIT_BASE_URL = 'https://verification.didit.me/v3';

interface IdVerificationResult {
  request_id: string;
  id_verification: {
    status: string;
    issuing_state?: string;
    issuing_state_name?: string;
    document_type?: string;
    document_number?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    date_of_birth?: string;
    expiration_date?: string;
    nationality?: string;
    gender?: string;
    portrait_image?: string;
    front_document_image?: string;
    back_document_image?: string;
    warnings?: Array<{ risk: string; short_description: string }>;
    [key: string]: unknown;
  };
  created_at: string;
}

interface LivenessResult {
  request_id: string;
  liveness: {
    status: string;
    method: string;
    score: number;
    warnings?: Array<{ risk: string; short_description: string }>;
    [key: string]: unknown;
  };
  created_at: string;
}

interface FaceMatchResult {
  request_id: string;
  face_match: {
    status: string;
    score: number;
    warnings?: Array<{ risk: string; short_description: string }>;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface DiditVerificationResult {
  idVerification?: IdVerificationResult;
  liveness?: LivenessResult;
  faceMatch?: FaceMatchResult;
  overallStatus: 'Approved' | 'Declined' | 'Review';
  errors: string[];
}

export interface KycFileData {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

@Injectable()
export class DiditVerificationService {
  private readonly logger = new Logger(DiditVerificationService.name);
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('DIDIT_API_KEY', '');
    if (!this.apiKey) {
      this.logger.warn('DIDIT_API_KEY not configured');
    }
  }

  /**
   * Run full KYC verification: ID document + liveness + face match.
   * Called after user uploads all required documents.
   */
  async verifyIdentity(
    documentFront: KycFileData,
    selfieImage: KycFileData,
    userId: string,
    documentBack?: KycFileData,
  ): Promise<DiditVerificationResult> {
    const errors: string[] = [];
    let idVerification: IdVerificationResult | undefined;
    let liveness: LivenessResult | undefined;
    let faceMatch: FaceMatchResult | undefined;

    // Step 1: ID Verification (document OCR + authenticity)
    try {
      idVerification = await this.verifyIdDocument(
        documentFront,
        userId,
        documentBack,
      );
      this.logger.log(
        `ID verification: status=${idVerification.id_verification.status}`,
      );
    } catch (error) {
      this.logger.error(`ID verification failed: ${error}`);
      errors.push(`ID verification failed: ${(error as Error).message}`);
    }

    // Step 2: Passive Liveness (anti-spoofing)
    try {
      liveness = await this.checkLiveness(selfieImage, userId);
      this.logger.log(
        `Liveness check: status=${liveness.liveness.status} score=${liveness.liveness.score}`,
      );
    } catch (error) {
      this.logger.error(`Liveness check failed: ${error}`);
      errors.push(`Liveness check failed: ${(error as Error).message}`);
    }

    // Step 3: Face Match (selfie vs document front)
    try {
      faceMatch = await this.matchFace(selfieImage, documentFront, userId);
      this.logger.log(
        `Face match: status=${faceMatch.face_match.status} score=${faceMatch.face_match.score}`,
      );
    } catch (error) {
      this.logger.error(`Face match failed: ${error}`);
      errors.push(`Face match failed: ${(error as Error).message}`);
    }

    // Determine overall status
    const overallStatus = this.determineOverallStatus(
      idVerification,
      liveness,
      faceMatch,
      errors,
    );

    return { idVerification, liveness, faceMatch, overallStatus, errors };
  }

  /**
   * Run driver's license verification (document only, no liveness/face match).
   */
  async verifyDriversLicense(
    documentFront: KycFileData,
    userId: string,
    documentBack?: KycFileData,
  ): Promise<DiditVerificationResult> {
    const errors: string[] = [];
    let idVerification: IdVerificationResult | undefined;

    try {
      idVerification = await this.verifyIdDocument(
        documentFront,
        userId,
        documentBack,
      );
      this.logger.log(
        `DL verification: status=${idVerification.id_verification.status}`,
      );
    } catch (error) {
      this.logger.error(`DL verification failed: ${error}`);
      errors.push(`DL verification failed: ${(error as Error).message}`);
    }

    const overallStatus = idVerification
      ? this.mapStatus(idVerification.id_verification.status)
      : 'Declined';

    return { idVerification, overallStatus, errors };
  }

  // ─── Standalone API calls ─────────────────────────────────────────────

  private async verifyIdDocument(
    front: KycFileData,
    vendorData: string,
    back?: KycFileData,
  ): Promise<IdVerificationResult> {
    const form = new FormData();

    form.append('front_image', front.buffer, {
      filename: front.originalName,
      contentType: front.mimeType,
    });

    if (back) {
      form.append('back_image', back.buffer, {
        filename: back.originalName,
        contentType: back.mimeType,
      });
    }

    form.append('perform_document_liveness', 'true');
    form.append('save_api_request', 'true');
    form.append('vendor_data', vendorData);

    return this.callDigitApi<IdVerificationResult>('/id-verification/', form);
  }

  private async checkLiveness(
    selfie: KycFileData,
    vendorData: string,
  ): Promise<LivenessResult> {
    const form = new FormData();

    form.append('user_image', selfie.buffer, {
      filename: selfie.originalName,
      contentType: selfie.mimeType,
    });
    form.append('save_api_request', 'true');
    form.append('vendor_data', vendorData);

    return this.callDigitApi<LivenessResult>('/passive-liveness/', form);
  }

  private async matchFace(
    selfie: KycFileData,
    refImage: KycFileData,
    vendorData: string,
  ): Promise<FaceMatchResult> {
    const form = new FormData();

    form.append('user_image', selfie.buffer, {
      filename: selfie.originalName,
      contentType: selfie.mimeType,
    });
    form.append('ref_image', refImage.buffer, {
      filename: refImage.originalName,
      contentType: refImage.mimeType,
    });
    form.append('face_match_score_decline_threshold', '40');
    form.append('save_api_request', 'true');
    form.append('vendor_data', vendorData);

    return this.callDigitApi<FaceMatchResult>('/face-match/', form);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private async callDigitApi<T>(endpoint: string, form: FormData): Promise<T> {
    const url = `${DIDIT_BASE_URL}${endpoint}`;

    // Convert form-data to Buffer — native fetch can't consume form-data streams
    const body = form.getBuffer();
    const headers = form.getHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        ...headers,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Didit API ${endpoint} returned ${response.status}: ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private determineOverallStatus(
    idVerification?: IdVerificationResult,
    liveness?: LivenessResult,
    faceMatch?: FaceMatchResult,
    errors?: string[],
  ): 'Approved' | 'Declined' | 'Review' {
    // If any critical step failed to call, send to review
    if (errors && errors.length > 0) return 'Review';

    const idStatus = idVerification?.id_verification.status;
    const livenessStatus = liveness?.liveness.status;
    const faceStatus = faceMatch?.face_match.status;

    // If any step is Declined, overall is Declined
    if (
      idStatus === 'Declined' ||
      livenessStatus === 'Declined' ||
      faceStatus === 'Declined'
    ) {
      return 'Declined';
    }

    // If all steps are Approved, overall is Approved
    if (
      idStatus === 'Approved' &&
      livenessStatus === 'Approved' &&
      faceStatus === 'Approved'
    ) {
      return 'Approved';
    }

    // Otherwise, needs review
    return 'Review';
  }

  private mapStatus(status: string): 'Approved' | 'Declined' | 'Review' {
    if (status === 'Approved') return 'Approved';
    if (status === 'Declined') return 'Declined';
    return 'Review';
  }
}
