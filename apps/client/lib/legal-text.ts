const dateEN = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const datePT = new Date().toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" });

const LEGAL_EN = {
  TERMS_OF_SERVICE: `
# Terms of Service

**Last Updated: ${dateEN}**

## 1. Acceptance of Terms

By accessing and using the Nasta platform ("Platform", "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Service.

## 2. Description of Service

Nasta is a marketplace platform that connects service providers (job seekers, freelancers, contractors) with employers seeking services. The Platform facilitates:

- Job posting and application management
- Service provider discovery and matching
- Secure payment processing through Stripe
- Identity verification (KYC) and background checks
- Real-time tracking and communication
- Booking and scheduling management
- In-app messaging and chat
- Support ticketing and abuse reporting

## 3. User Accounts and Registration

### 3.1 Account Creation
- You must provide accurate, current, and complete information during registration
- You must be at least 18 years old to use the Platform
- You are responsible for maintaining the confidentiality of your account credentials
- You agree to accept responsibility for all activities that occur under your account

### 3.2 Account Types
- **Employers**: Users who post jobs and hire service providers
- **Service Providers**: Users who offer services and apply for jobs
- **Admins**: Platform administrators with specific capabilities

### 3.3 Verification Requirements
- Identity verification (KYC) is mandatory for all service providers
- Background checks may be required for certain job categories
- Business verification may be required for employers
- Failure to complete verification may result in account restrictions

## 4. Platform Rules and Prohibited Conduct

### 4.1 Prohibited Activities
You agree NOT to:
- Post false, misleading, or fraudulent information
- Engage in harassment, discrimination, or hate speech
- Solicit services or payments outside the Platform
- Share personal contact information before a booking is confirmed
- Use the Platform for illegal activities
- Violate any applicable laws or regulations

## 5. Payments and Financial Terms

- All payments are processed through Stripe
- Payment processing is subject to Stripe's terms and conditions
- Service providers receive payments after job completion
- Platform fees are clearly disclosed before transactions

## 6. Intellectual Property

- All content on the Platform is protected by copyright and other intellectual property laws
- You retain ownership of content you post, but grant Nasta a license to use it
- You may not use Nasta's trademarks or logos without permission

## 7. Limitation of Liability

- Nasta provides the Platform "as is" without warranties
- We are not liable for any indirect, incidental, or consequential damages
- Our total liability is limited to the amount you paid us in the past 12 months

## 8. Termination

- We may suspend or terminate accounts for violations of these Terms
- You may delete your account at any time
- Upon termination, your right to use the Platform immediately ceases

## 9. Changes to Terms

- We may update these Terms at any time
- Continued use after changes constitutes acceptance
- We will notify users of material changes

## 10. Governing Law

- These Terms are governed by the laws of Portugal
- Any disputes will be resolved in Portuguese courts

## 11. Contact Information

For questions about these Terms, please contact:
- **Email**: legal@nasta.app
- **Website**: https://nasta.app/terms

## 12. Severability

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.

## 13. Entire Agreement

These Terms, together with the Privacy Policy, constitute the entire agreement between you and Nasta regarding the use of the Platform.

**By using Nasta, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.**
`,

  PRIVACY_POLICY: `
# Privacy Policy

**Last Updated: ${dateEN}**

## Introduction

Nasta ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform ("App" or "Platform").

## 1. Information We Collect

### 1.1 Personal Information
- Name, email address, phone number
- Date of birth and identity verification documents
- Payment and banking information
- Location data
- Profile photos and descriptions

### 1.2 Usage Information
- Device information
- IP address
- Browser type and version
- Usage patterns and preferences
- Communication logs

### 1.3 Cookies and Tracking
- We use cookies and similar technologies
- You can manage cookie preferences in settings
- See our Cookie Policy for more details

## 2. How We Use Your Information

We use collected information to:
- Provide and improve our services
- Process transactions and payments
- Verify user identities
- Communicate with you
- Enforce Platform rules and policies
- Comply with legal obligations

## 3. Information Sharing

We may share your information with:
- Service providers (payment processors, verification services)
- Legal authorities when required by law
- Other users (as necessary for platform functionality)
- Business partners (with your consent)

## 4. Data Security

- We implement industry-standard security measures
- Your data is encrypted in transit and at rest
- We regularly audit our security practices
- However, no method of transmission is 100% secure

## 5. Your Privacy Rights

You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Object to processing
- Data portability
- Withdraw consent

## 6. Children's Privacy

- Our Platform is not intended for users under 18
- We do not knowingly collect data from children
- If we discover we have collected data from a child, we will delete it

## 7. International Data Transfers

- Your data may be transferred and processed outside your country
- We ensure appropriate safeguards are in place
- By using the Platform, you consent to such transfers

## 8. Third-Party Services

- Payment processing: Stripe's privacy policy applies to payment data
- Verification services: Verification services have their own privacy policies
- Analytics: We may use third-party analytics services

## 9. Data Retention

- We retain your data as long as your account is active
- We may retain certain data after account deletion for legal compliance
- You can request data deletion at any time

## 10. Changes to This Privacy Policy

- We may update this Privacy Policy from time to time
- We will notify you of material changes
- Continued use after changes constitutes acceptance

## 11. Contact Us

For privacy-related questions or requests:
- **Email**: privacy@nasta.app
- **Website**: https://nasta.app/privacy

**By using Nasta, you acknowledge that you have read and understood this Privacy Policy.**
`,

  COOKIES: `
# Cookies Settings

**Last Updated: ${dateEN}**

## What Are Cookies?

Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow certain features to work properly.

## Types of Cookies We Use

### Essential Cookies
These cookies are necessary for the website to function properly. They cannot be disabled.

### Analytics Cookies
These cookies help us understand how visitors use our website by collecting and reporting information anonymously.

**Retention**: Up to 2 years

### Marketing Cookies
These cookies are used to deliver relevant advertisements and track campaign performance.

**Retention**: Up to 1 year

## Your Rights

- Access information about cookies we use
- Opt-out of non-essential cookies
- Delete cookies through your device settings
- Request information about data collected

## Changes to Cookie Policy

We may update our cookie practices. Changes will be reflected in this policy and notified through the app.

## Managing Cookies

You can manage your cookie preferences using the toggles below. Essential cookies cannot be disabled as they are required for the website to function.

**Note**: Website functionality is currently under development. Cookie preferences will be fully implemented when the website launches.
`,

  PLATFORM_RULES: `
# Platform Rules

**Last Updated: ${dateEN}**

## Introduction

These Platform Rules ("Rules") govern acceptable behavior and conduct on Nasta. All users must follow these Rules to maintain a safe, respectful, and professional environment.

## 1. General Conduct

### 1.1 Respectful Communication
- Treat all users with respect and professionalism
- No harassment, bullying, or abusive language
- No discrimination based on race, gender, religion, or other protected characteristics
- Maintain professional boundaries in all interactions

### 1.2 Honesty and Transparency
- Provide accurate information in your profile
- Be honest about your skills and experience
- Clearly communicate expectations and requirements
- Report any suspicious or fraudulent activity

## 2. Job Postings

### 2.1 Accurate Job Descriptions
- Post clear, accurate job descriptions
- Include all relevant details (location, pay, requirements)
- Update job status promptly
- Remove filled or cancelled jobs

### 2.2 Fair Compensation
- Offer fair and competitive rates
- Payment terms must be transparent
- No attempts to negotiate payments outside the platform
- Honor agreed-upon payment schedules

## 3. Service Provider Conduct

### 3.1 Professionalism
- Complete work to the best of your ability
- Meet agreed-upon deadlines
- Communicate proactively about delays or issues
- Maintain professional appearance and behavior

### 3.2 Qualifications
- Only apply for jobs you are qualified to perform
- Provide accurate information about your experience
- Complete required verifications
- Maintain necessary licenses and certifications

## 4. Payment and Transactions

### 4.1 Payment Processing
- All payments must go through the Platform
- No requests for payment outside the Platform
- Report any payment issues immediately
- Understand and accept payment terms before accepting jobs

### 4.2 Cancellations
- Follow cancellation policies
- Provide adequate notice when possible
- Understand cancellation fees and refund policies
- Communicate cancellations clearly

## 5. Prohibited Activities

You may NOT:
- Engage in illegal activities
- Post false or misleading information
- Solicit services outside the Platform
- Share personal contact information before booking confirmation
- Harass, threaten, or discriminate against other users
- Create fake accounts or impersonate others
- Manipulate reviews or ratings
- Violate intellectual property rights

## 6. Enforcement

Nasta administrators may take the following actions to maintain platform safety and enforce rules:
- Issue warnings
- Suspend accounts temporarily
- Permanently ban accounts
- Report illegal activity to authorities
- Remove content that violates rules

## 7. Reporting Violations

If you witness a violation of these Rules:
- Report it through the in-app reporting system
- Provide as much detail as possible
- Include screenshots or evidence when available
- We investigate all reports promptly

## 8. Appeals Process

If you believe you were unfairly penalized:
- Contact support with your account information
- Explain the situation clearly
- Provide any relevant evidence
- We will review your case and respond

## 9. Updates to Rules

- We may modify Platform rules at any time
- Significant changes will be communicated to users
- Continued use after changes constitutes acceptance
- Check this page regularly for updates

## 10. Contact

For questions about Platform Rules:
- **Email**: support@nasta.app
- **In-App**: Use the support ticket system

**By using Nasta, you agree to follow these Platform Rules. Violations may result in penalties up to and including account termination.**
`,

  ACCOUNT_DELETION: `
# Delete Your Account

**Last Updated: ${dateEN}**

## How to request account deletion

- Open the Nasta mobile app
- Go to **Settings**
- Tap **Delete account**
- Select a reason, optionally add details, confirm, and submit

## What happens next

- We will process your request and delete your account and associated personal data.
- Some information may be retained when necessary for legal, security, fraud-prevention, or financial record-keeping purposes.

## If you cannot access the app

- Email **support@nasta.app** from the email address associated with your account.
- Use the subject: **Account Deletion Request**
`,
};

const LEGAL_PT: typeof LEGAL_EN = {
  TERMS_OF_SERVICE: `
# Termos de Serviço

**Última Atualização: ${datePT}**

## 1. Aceitação dos Termos

Ao aceder e utilizar a plataforma Nasta ("Plataforma", "Serviço"), concorda em ficar vinculado a estes Termos de Serviço ("Termos"). Se não concordar com estes Termos, não deve utilizar o Serviço.

## 2. Descrição do Serviço

A Nasta é uma plataforma de mercado que liga prestadores de serviços (candidatos a emprego, freelancers, contratados) a empregadores que procuram serviços. A Plataforma facilita:

- Publicação e gestão de ofertas de emprego
- Descoberta e correspondência de prestadores de serviços
- Processamento seguro de pagamentos através do Stripe
- Verificação de identidade (KYC) e verificação de antecedentes
- Rastreamento e comunicação em tempo real
- Gestão de reservas e agendamento
- Mensagens e chat na aplicação
- Tickets de suporte e denúncia de abusos

## 3. Contas de Utilizador e Registo

### 3.1 Criação de Conta
- Deve fornecer informações precisas, atuais e completas durante o registo
- Deve ter pelo menos 18 anos para utilizar a Plataforma
- É responsável por manter a confidencialidade das suas credenciais de conta
- Concorda em aceitar a responsabilidade por todas as atividades que ocorram na sua conta

### 3.2 Tipos de Conta
- **Empregadores**: Utilizadores que publicam empregos e contratam prestadores de serviços
- **Prestadores de Serviços**: Utilizadores que oferecem serviços e candidatam-se a empregos
- **Administradores**: Administradores da plataforma com capacidades específicas

### 3.3 Requisitos de Verificação
- A verificação de identidade (KYC) é obrigatória para todos os prestadores de serviços
- Verificações de antecedentes podem ser necessárias para certas categorias de emprego
- A verificação empresarial pode ser necessária para empregadores
- O incumprimento da verificação pode resultar em restrições de conta

## 4. Regras da Plataforma e Conduta Proibida

### 4.1 Atividades Proibidas
Concorda em NÃO:
- Publicar informações falsas, enganosas ou fraudulentas
- Participar em assédio, discriminação ou discurso de ódio
- Solicitar serviços ou pagamentos fora da Plataforma
- Partilhar informações de contacto pessoal antes de uma reserva ser confirmada
- Utilizar a Plataforma para atividades ilegais
- Violar quaisquer leis ou regulamentos aplicáveis

## 5. Pagamentos e Termos Financeiros

- Todos os pagamentos são processados através do Stripe
- O processamento de pagamentos está sujeito aos termos e condições do Stripe
- Os prestadores de serviços recebem pagamentos após a conclusão do trabalho
- As taxas da plataforma são claramente divulgadas antes das transações

## 6. Propriedade Intelectual

- Todo o conteúdo na Plataforma está protegido por direitos de autor e outras leis de propriedade intelectual
- Retém a propriedade do conteúdo que publica, mas concede à Nasta uma licença para o utilizar
- Não pode utilizar as marcas comerciais ou logótipos da Nasta sem autorização

## 7. Limitação de Responsabilidade

- A Nasta fornece a Plataforma "tal como está" sem garantias
- Não somos responsáveis por quaisquer danos indiretos, incidentais ou consequenciais
- A nossa responsabilidade total está limitada ao montante que nos pagou nos últimos 12 meses

## 8. Rescisão

- Podemos suspender ou encerrar contas por violações destes Termos
- Pode eliminar a sua conta a qualquer momento
- Após a rescisão, o seu direito de utilizar a Plataforma cessa imediatamente

## 9. Alterações aos Termos

- Podemos atualizar estes Termos a qualquer momento
- A utilização continuada após as alterações constitui aceitação
- Notificaremos os utilizadores de alterações materiais

## 10. Lei Aplicável

- Estes Termos são regidos pelas leis de Portugal
- Quaisquer disputas serão resolvidas nos tribunais portugueses

## 11. Informações de Contacto

Para questões sobre estes Termos, por favor contacte:
- **Email**: legal@nasta.app
- **Website**: https://nasta.app/terms

## 12. Divisibilidade

Se qualquer disposição destes Termos for considerada inexequível, as restantes disposições permanecerão em pleno efeito.

## 13. Acordo Integral

Estes Termos, juntamente com a Política de Privacidade, constituem o acordo integral entre si e a Nasta relativamente à utilização da Plataforma.

**Ao utilizar a Nasta, reconhece que leu, compreendeu e concorda em ficar vinculado a estes Termos de Serviço.**
`,

  PRIVACY_POLICY: `
# Política de Privacidade

**Última Atualização: ${datePT}**

## Introdução

A Nasta ("nós", "nosso" ou "nos") está comprometida em proteger a sua privacidade. Esta Política de Privacidade explica como recolhemos, utilizamos, divulgamos e protegemos as suas informações quando utiliza a nossa plataforma ("App" ou "Plataforma").

## 1. Informações que Recolhemos

### 1.1 Informações Pessoais
- Nome, endereço de email, número de telefone
- Data de nascimento e documentos de verificação de identidade
- Informações de pagamento e bancárias
- Dados de localização
- Fotos de perfil e descrições

### 1.2 Informações de Utilização
- Informações do dispositivo
- Endereço IP
- Tipo e versão do navegador
- Padrões e preferências de utilização
- Registos de comunicação

### 1.3 Cookies e Rastreamento
- Utilizamos cookies e tecnologias semelhantes
- Pode gerir as preferências de cookies nas definições
- Consulte a nossa Política de Cookies para mais detalhes

## 2. Como Utilizamos as Suas Informações

Utilizamos as informações recolhidas para:
- Fornecer e melhorar os nossos serviços
- Processar transações e pagamentos
- Verificar identidades de utilizadores
- Comunicar consigo
- Aplicar as regras e políticas da Plataforma
- Cumprir obrigações legais

## 3. Partilha de Informações

Podemos partilhar as suas informações com:
- Prestadores de serviços (processadores de pagamento, serviços de verificação)
- Autoridades legais quando exigido por lei
- Outros utilizadores (conforme necessário para a funcionalidade da plataforma)
- Parceiros comerciais (com o seu consentimento)

## 4. Segurança de Dados

- Implementamos medidas de segurança padrão da indústria
- Os seus dados são encriptados em trânsito e em repouso
- Auditamos regularmente as nossas práticas de segurança
- No entanto, nenhum método de transmissão é 100% seguro

## 5. Os Seus Direitos de Privacidade

Tem o direito de:
- Aceder aos seus dados pessoais
- Corrigir informações imprecisas
- Eliminar a sua conta e dados
- Opor-se ao processamento
- Portabilidade de dados
- Retirar o consentimento

## 6. Privacidade de Menores

- A nossa Plataforma não se destina a utilizadores menores de 18 anos
- Não recolhemos conscientemente dados de crianças
- Se descobrirmos que recolhemos dados de uma criança, iremos eliminá-los

## 7. Transferências Internacionais de Dados

- Os seus dados podem ser transferidos e processados fora do seu país
- Garantimos que estão implementadas salvaguardas adequadas
- Ao utilizar a Plataforma, consente tais transferências

## 8. Serviços de Terceiros

- Processamento de pagamentos: a política de privacidade do Stripe aplica-se aos dados de pagamento
- Serviços de verificação: os serviços de verificação têm as suas próprias políticas de privacidade
- Análises: podemos utilizar serviços de análise de terceiros

## 9. Retenção de Dados

- Retemos os seus dados enquanto a sua conta estiver ativa
- Podemos reter certos dados após a eliminação da conta para conformidade legal
- Pode solicitar a eliminação de dados a qualquer momento

## 10. Alterações a Esta Política de Privacidade

- Podemos atualizar esta Política de Privacidade periodicamente
- Notificaremos sobre alterações materiais
- A utilização continuada após as alterações constitui aceitação

## 11. Contacte-nos

Para questões ou pedidos relacionados com privacidade:
- **Email**: privacy@nasta.app
- **Website**: https://nasta.app/privacy

**Ao utilizar a Nasta, reconhece que leu e compreendeu esta Política de Privacidade.**
`,

  COOKIES: `
# Definições de Cookies

**Última Atualização: ${datePT}**

## O Que São Cookies?

Cookies são pequenos ficheiros de texto que são colocados no seu dispositivo quando visita o nosso website. Ajudam-nos a proporcionar-lhe uma melhor experiência e permitem que certas funcionalidades funcionem corretamente.

## Tipos de Cookies que Utilizamos

### Cookies Essenciais
Estes cookies são necessários para o website funcionar corretamente. Não podem ser desativados.

### Cookies de Análise
Estes cookies ajudam-nos a compreender como os visitantes utilizam o nosso website, recolhendo e reportando informações de forma anónima.

**Retenção**: Até 2 anos

### Cookies de Marketing
Estes cookies são utilizados para apresentar anúncios relevantes e acompanhar o desempenho das campanhas.

**Retenção**: Até 1 ano

## Os Seus Direitos

- Aceder a informações sobre os cookies que utilizamos
- Optar por não aceitar cookies não essenciais
- Eliminar cookies através das definições do seu dispositivo
- Solicitar informações sobre os dados recolhidos

## Alterações à Política de Cookies

Podemos atualizar as nossas práticas de cookies. As alterações serão refletidas nesta política e notificadas através da aplicação.

## Gerir Cookies

Pode gerir as suas preferências de cookies utilizando os controlos abaixo. Os cookies essenciais não podem ser desativados, pois são necessários para o funcionamento do website.

**Nota**: A funcionalidade do website está atualmente em desenvolvimento. As preferências de cookies serão totalmente implementadas quando o website for lançado.
`,

  PLATFORM_RULES: `
# Regras da Plataforma

**Última Atualização: ${datePT}**

## Introdução

Estas Regras da Plataforma ("Regras") regem o comportamento e conduta aceitáveis na Nasta. Todos os utilizadores devem seguir estas Regras para manter um ambiente seguro, respeitoso e profissional.

## 1. Conduta Geral

### 1.1 Comunicação Respeitosa
- Trate todos os utilizadores com respeito e profissionalismo
- Sem assédio, bullying ou linguagem abusiva
- Sem discriminação com base em raça, género, religião ou outras características protegidas
- Mantenha limites profissionais em todas as interações

### 1.2 Honestidade e Transparência
- Forneça informações precisas no seu perfil
- Seja honesto sobre as suas competências e experiência
- Comunique claramente expectativas e requisitos
- Denuncie qualquer atividade suspeita ou fraudulenta

## 2. Publicações de Emprego

### 2.1 Descrições de Emprego Precisas
- Publique descrições de emprego claras e precisas
- Inclua todos os detalhes relevantes (localização, pagamento, requisitos)
- Atualize o estado do emprego prontamente
- Remova empregos preenchidos ou cancelados

### 2.2 Compensação Justa
- Ofereça taxas justas e competitivas
- Os termos de pagamento devem ser transparentes
- Sem tentativas de negociar pagamentos fora da plataforma
- Honre os calendários de pagamento acordados

## 3. Conduta do Prestador de Serviços

### 3.1 Profissionalismo
- Complete o trabalho com o melhor das suas capacidades
- Cumpra os prazos acordados
- Comunique proativamente sobre atrasos ou problemas
- Mantenha aparência e comportamento profissionais

### 3.2 Qualificações
- Candidate-se apenas a empregos para os quais está qualificado
- Forneça informações precisas sobre a sua experiência
- Complete as verificações necessárias
- Mantenha as licenças e certificações necessárias

## 4. Pagamentos e Transações

### 4.1 Processamento de Pagamentos
- Todos os pagamentos devem passar pela Plataforma
- Sem pedidos de pagamento fora da Plataforma
- Reporte quaisquer problemas de pagamento imediatamente
- Compreenda e aceite os termos de pagamento antes de aceitar trabalhos

### 4.2 Cancelamentos
- Siga as políticas de cancelamento
- Forneça aviso adequado quando possível
- Compreenda as taxas de cancelamento e políticas de reembolso
- Comunique cancelamentos claramente

## 5. Atividades Proibidas

NÃO pode:
- Participar em atividades ilegais
- Publicar informações falsas ou enganosas
- Solicitar serviços fora da Plataforma
- Partilhar informações de contacto pessoal antes da confirmação da reserva
- Assediar, ameaçar ou discriminar outros utilizadores
- Criar contas falsas ou fazer-se passar por outros
- Manipular avaliações ou classificações
- Violar direitos de propriedade intelectual

## 6. Aplicação

Os administradores da Nasta podem tomar as seguintes medidas para manter a segurança da plataforma e aplicar as regras:
- Emitir avisos
- Suspender contas temporariamente
- Banir contas permanentemente
- Denunciar atividades ilegais às autoridades
- Remover conteúdo que viole as regras

## 7. Denúncia de Violações

Se presenciar uma violação destas Regras:
- Denuncie através do sistema de denúncia na aplicação
- Forneça o máximo de detalhes possível
- Inclua capturas de ecrã ou provas quando disponíveis
- Investigamos todas as denúncias prontamente

## 8. Processo de Recurso

Se acredita que foi penalizado injustamente:
- Contacte o suporte com as informações da sua conta
- Explique a situação claramente
- Forneça quaisquer provas relevantes
- Analisaremos o seu caso e responderemos

## 9. Atualizações das Regras

- Podemos modificar as Regras da Plataforma a qualquer momento
- Alterações significativas serão comunicadas aos utilizadores
- A utilização continuada após as alterações constitui aceitação
- Consulte esta página regularmente para atualizações

## 10. Contacto

Para questões sobre as Regras da Plataforma:
- **Email**: support@nasta.app
- **Na App**: Utilize o sistema de tickets de suporte

**Ao utilizar a Nasta, concorda em seguir estas Regras da Plataforma. As violações podem resultar em penalidades até e incluindo a rescisão da conta.**
`,

  ACCOUNT_DELETION: `
# Eliminar a Sua Conta

**Última Atualização: ${datePT}**

## Como solicitar a eliminação da conta

- Abra a aplicação móvel Nasta
- Vá a **Definições**
- Toque em **Eliminar conta**
- Selecione um motivo, opcionalmente adicione detalhes, confirme e submeta

## O que acontece a seguir

- Processaremos o seu pedido e eliminaremos a sua conta e dados pessoais associados.
- Algumas informações podem ser retidas quando necessário para fins legais, de segurança, prevenção de fraude ou manutenção de registos financeiros.

## Se não conseguir aceder à aplicação

- Envie email para **support@nasta.app** a partir do endereço de email associado à sua conta.
- Utilize o assunto: **Pedido de Eliminação de Conta**
`,
};

export type LegalTextKeys = keyof typeof LEGAL_EN;

const LEGAL_TEXTS: Record<string, typeof LEGAL_EN> = {
  en: LEGAL_EN,
  pt: LEGAL_PT,
};

/** Return legal text object for the given language (falls back to English). */
export function getLegalText(lang: string): typeof LEGAL_EN {
  return LEGAL_TEXTS[lang] ?? LEGAL_EN;
}

/** Legacy export – English text for backwards compatibility. */
export const LEGAL_TEXT = LEGAL_EN;
