import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, "..", "locales");

const enPath = join(localesDir, "en.json");
const ptPath = join(localesDir, "pt.json");

const en = JSON.parse(readFileSync(enPath, "utf8"));
const pt = JSON.parse(readFileSync(ptPath, "utf8"));

// ─── Add missing howItWorks keys to EN ───
Object.assign(en.howItWorks, {
  heroLabel: "How it works",
  heroDesc:
    "We take trust seriously. Every user completes a verification process before they can post or accept a single job. Here is exactly what is required for each side.",
  spFullDesc:
    "Complete your verification to unlock instant job requests and start earning. Every step builds your trust score and visibility to employers.",
  empFullDesc:
    "A lighter setup so you can start hiring fast. Add the essentials and request your first service provider today.",
  stillHaveQuestions: "Still have questions?",
  stillHaveQuestionsDesc:
    "Our team is here to help. Whether you need guidance on verification, payment, or anything else, reach out anytime.",
  contactSupport: "Contact Support",
  viewFAQs: "View FAQs",
});

// ─── Update faq stillHaveQuestionsDesc if needed ───
en.faq.contactSupport = "Contact Support";

// ─── About page ───
en.aboutPage = {
  title: "About Nasta",
  intro:
    "Nasta is an on-demand workforce marketplace that connects verified service providers with trusted employers instantly. Whether you need someone right now for an urgent task or want to schedule a long-term contract, Nasta makes hiring fast, fair, and fully transparent.",
  missionTitle: "Our Mission",
  missionDesc:
    "We believe that everyone deserves instant access to legitimate work opportunities, and every employer deserves instant access to reliable, verified talent. Nasta was built to make that connection instant and seamless, while protecting both sides with secure payments, identity verification, and real-time job monitoring.",
  howItWorksTitle: "How It Works",
  forSP: "For Service Providers:",
  forSPDesc:
    "Create a verified profile and receive instant job requests near you. Use Nasta as your main income or a flexible side gig, and get paid securely when the work is done.",
  forEmp: "For Employers:",
  forEmpDesc:
    "Post instant requests for on-demand help or schedule jobs across unlimited categories. Browse verified candidates, book with confidence, and only release payment when you're satisfied.",
  trustTitle: "Trust & Safety",
  trustDesc:
    "Every user on Nasta is identity-verified with government-issued documents. Payments are held in escrow via Stripe until the job is complete. Live GPS tracking and digital check-in/out ensure full accountability for every assignment.",
  contactTitle: "Contact Us",
  contactDesc: "Have questions? Reach out at",
};

// ─── For Employers page ───
en.forEmployersPage = {
  heroLabel: "For Employers",
  heroTitle: "Instant access to verified talent",
  heroDesc:
    "Need something done right now? Request instantly available, verified service providers on demand. Every worker is ID-verified, every assignment is monitored in real-time, and every payment is protected by Stripe escrow.",
  whyTitle: "Why employers choose Nasta",
  benefit0Title: "ID-Verified Workers",
  benefit0Desc:
    "Every service provider undergoes government ID verification before they can accept any assignment. You always know exactly who is showing up.",
  benefit1Title: "Secure Escrow Payments",
  benefit1Desc:
    "Your money is held safely by Stripe until the job is marked complete. You only release payment when you are satisfied with the work.",
  benefit2Title: "Real-Time Monitoring",
  benefit2Desc:
    "Live GPS tracking and digital check-in/out for every assignment. Full visibility from start to finish, so there are never any surprises.",
  benefit3Title: "Instant Requests",
  benefit3Desc:
    "Need help right now? Post an instant request and get matched with verified, available service providers near you. Or schedule ahead for planned work.",
  benefit4Title: "Ratings and Reviews",
  benefit4Desc:
    "See every service provider's track record before you book. Verified reviews from real employers help you make confident decisions.",
  benefit5Title: "Unlimited Categories",
  benefit5Desc:
    "From cleaning and childcare to construction and events. Post any type of job across unlimited service categories.",
  howTitle: "How it works",
  step0Title: "Post or request instantly",
  step0Desc:
    "Need help right now? Use instant request to find available providers nearby. Or post a scheduled job for later. Takes less than two minutes.",
  step1Title: "Get matched with verified talent",
  step1Desc:
    "Instantly available service providers are matched to your request. Every one is ID-verified with ratings, reviews, and verified experience.",
  step2Title: "Book, monitor, and pay",
  step2Desc:
    "Book with confidence. Track the assignment in real-time. Release payment only when the work meets your standards.",
  reqTitle: "What you need to get started",
  reqDesc:
    "A quick setup so you can start hiring fast. Add the essentials and request your first service provider today.",
  req0Title: "Physical Address",
  req0Desc: "Your business or residential address for job location accuracy",
  req1Title: "Phone Number",
  req1Desc: "For direct communication and account security",
  req2Title: "Email & Phone Verification",
  req2Desc: "SMS and email confirmation to verify your account",
  req3Title: "Payment Method",
  req3Desc: "Add a card to book service providers and secure payment in escrow",
  required: "Required",
  optional: "Optional",
  protectedTitle: "Your money is protected",
  protectedP1:
    "When you book a service provider, payment is secured in Stripe escrow before work begins. The service provider can see the payment is secured, but cannot access the funds.",
  protectedP2:
    "Once the job is complete and you confirm satisfaction, the funds are released. If there is a dispute, our team reviews the case with full GPS logs, check-in/out records, and communication history.",
  protectedP3:
    "Nasta takes a small platform commission to cover payment processing, identity verification, and monitoring infrastructure. You never pay more than the agreed job price.",
  ctaTitle: "Ready to hire?",
  ctaDesc: "Create a free employer account and post your first job in minutes.",
  ctaButton: "Create Employer Account",
};

// ─── For Service Providers page ───
en.forServiceProvidersPage = {
  heroLabel: "For Service Providers",
  heroTitle: "Earn instantly. On your terms.",
  heroDesc:
    "Whether it is your main income or a side gig, Nasta connects you with instant job requests from verified employers. Get paid fast, work on your schedule, and build your reputation.",
  whyTitle: "Why service providers choose Nasta",
  benefit0Title: "Instant Payouts",
  benefit0Desc:
    "Funds are released as soon as the job is marked complete. No invoices, no delays. Instant payouts straight to your account, perfect for side income.",
  benefit1Title: "Payment Guaranteed",
  benefit1Desc:
    "Every job is backed by Stripe escrow. The employer's payment is secured before you start, so you are guaranteed to be paid for completed work.",
  benefit2Title: "Verified Employers",
  benefit2Desc:
    "Every employer on Nasta is verified too. You always know who you are working for, with transparent job details and fair terms.",
  benefit3Title: "Unlimited Categories",
  benefit3Desc:
    "Cleaning, childcare, construction, events, tutoring, and more. Pick up instant jobs in any category, whether as your main work or a side gig.",
  benefit4Title: "Mobile First",
  benefit4Desc:
    "Get instant job notifications, apply with one tap, chat with employers, and track your earnings. Full-featured iOS and Android app.",
  benefit5Title: "Build Your Reputation",
  benefit5Desc:
    "Every completed job earns you ratings and reviews. A strong profile means more bookings, better jobs, and higher earnings over time.",
  howTitle: "How it works",
  step0Title: "Create your profile",
  step0Desc:
    "Sign up for free, verify your identity with a government ID, and set up your skills and availability. Takes less than five minutes.",
  step1Title: "Get instant job requests",
  step1Desc:
    "Receive real-time notifications for jobs near you that match your skills. Accept with one tap, or browse and apply on your schedule.",
  step2Title: "Work and get paid",
  step2Desc:
    "Complete the assignment, check out digitally, and funds are released to your payout account. Simple, fast, transparent.",
  verifyTitle: "Get verified once, earn forever",
  verifyDesc:
    "Complete your verification to unlock instant job requests and start earning. Every step builds your trust score and visibility.",
  req0Title: "Identity Verification",
  req0Desc: "Government-issued photo ID to confirm your real identity",
  req1Title: "Driver's License",
  req1Desc: "Required for driving jobs, must be issued at least 3 years ago",
  req2Title: "Background & Criminal Record Check",
  req2Desc: "Comprehensive screening for your safety and employer trust",
  req3Title: "Professional CV",
  req3Desc: "Your work experience and qualifications on file",
  req4Title: "Skills & Service Rates",
  req4Desc: "List your professional skills with your service rates in EUR",
  req5Title: "Bank Account & Payout Setup",
  req5Desc:
    "Date of birth, address, verified phone and email required for payouts",
  req6Title: "Phone & Email Verification",
  req6Desc: "SMS and email confirmation to secure your account",
  required: "Required",
  protectedTitle: "Your earnings are protected",
  protectedP1:
    "Before you start any job, the employer's payment is already secured in Stripe escrow. Whether this is your full-time work or a side gig, you will never do work without the guarantee of getting paid.",
  protectedP2:
    "Once the job is complete and confirmed, your earnings are released directly to your connected payout account. Most payouts arrive within 1-2 business days.",
  protectedP3:
    "Nasta takes a small platform commission from each completed job to cover payment processing and platform operations. You always see the exact amount you will earn before accepting a job.",
  ctaTitle: "Ready to start earning?",
  ctaDesc:
    "Create a free account, verify your identity, and start applying for jobs today.",
  ctaButton: "Create Free Account",
};

// ─── Support page (web) ───
en.supportPage = {
  title: "Support",
  subtitle:
    "Need help? We are here for you. Choose a topic below or send us a message.",
  faqsTitle: "FAQs",
  faqsDesc: "Browse common questions",
  deleteAccountTitle: "Delete Account",
  deleteAccountDesc: "Request permanent deletion",
  contactUsTitle: "Contact Us",
  contactUsDesc: "For general support or policy inquiries",
  department: "Department",
  generalSupport: "General Support",
  policyLegal: "Policy & Legal",
  sendingTo: "Sending to",
  name: "Name",
  email: "Email",
  subject: "Subject",
  message: "Message",
  sendMessage: "Send Message",
  openingEmailClient: "Opening email client...",
  namePlaceholder: "Your full name",
  emailPlaceholder: "you@example.com",
  subjectPlaceholder: "Brief summary of your inquiry",
  messagePlaceholder: "Describe your question or issue in detail...",
  featureRequestTitle: "Feature Request",
  featureRequestDesc:
    "Suggest a new feature or improvement. Sends to feature-request@nasta.app",
  featureTitle: "Feature Title",
  description: "Description",
  submitRequest: "Submit Request",
  featureTitlePlaceholder: "e.g. Add scheduling for recurring jobs",
  descriptionPlaceholder:
    "Describe the feature, why it would be useful, and any details that help us understand your idea...",
};

// ═══════════════════════════════════════════════════════════════
// ─── PORTUGUESE TRANSLATIONS ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════

// ─── FAQ ───
pt.faq = {
  title: "Perguntas Frequentes",
  subtitle: "Tudo o que precisa de saber sobre a Nasta.",
  stillHaveQuestions: "Ainda tem dúvidas?",
  stillHaveQuestionsDesc:
    "Estamos aqui para ajudar. Contacte-nos a qualquer momento.",
  contactSupport: "Contactar Suporte",
  q1: "O que é a Nasta?",
  a1: "A Nasta é um marketplace on-demand que conecta prestadores de serviços verificados com empregadores de confiança para trabalho instantâneo. Pense nisto como uma app de transporte, mas para trabalhos. Empregadores podem pedir ajuda agora mesmo, e prestadores de serviços podem aceitar trabalhos instantaneamente como trabalho principal ou extra.",
  q2: "Como funciona o pagamento?",
  a2: "Quando um empregador reserva um trabalho, o pagamento é assegurado antecipadamente via Stripe e retido em custódia. Assim que o trabalho é marcado como concluído por ambas as partes, os fundos são libertados automaticamente para o prestador de serviços.",
  q3: "A minha identidade é verificada?",
  a3: "Sim. Todos os utilizadores da Nasta passam por verificação de identidade com documentos emitidos pelo governo antes de poderem aceitar ou publicar trabalhos. Isto protege tanto empregadores como prestadores de serviços.",
  q4: "Que tipos de trabalhos posso encontrar na Nasta?",
  a4: "A Nasta suporta categorias ilimitadas de trabalho incluindo limpeza, cuidado de crianças, cuidado de idosos, construção, eventos, mudanças, jardinagem, tutoria e muito mais. Se o consegue fazer, pode listá-lo.",
  q5: "Como é que a Nasta protege os empregadores?",
  a5: "Os empregadores só pagam quando o trabalho está concluído. Todos os trabalhadores são verificados por ID, as tarefas incluem rastreamento GPS em tempo real e check-in/check-out digital, e existe uma política justa de cancelamento e proteção contra faltas.",
  q6: "Como é que a Nasta protege os prestadores de serviços?",
  a6: "O pagamento é assegurado antes do início do trabalho, portanto tem garantia de ser pago pelo trabalho concluído. Todos os empregadores também são verificados, e pode avaliar e comentar cada tarefa.",
  q7: "Quais são as taxas?",
  a7: "Criar uma conta é gratuito tanto para empregadores como para prestadores de serviços. A Nasta cobra uma pequena comissão de plataforma por cada trabalho concluído para cobrir processamento de pagamentos e operações da plataforma.",
  q8: "A Nasta está disponível no telemóvel?",
  a8: "Sim. A Nasta tem apps completas para iOS e Android. Pode candidatar-se a trabalhos, gerir reservas, conversar e receber pagamentos tudo a partir do seu telemóvel.",
  q9: "Como começo?",
  a9: "Basta criar uma conta gratuita, verificar a sua identidade, configurar o seu perfil e começar a navegar. Todo o processo demora menos de cinco minutos.",
  q10: "Posso usar a Nasta como trabalho extra?",
  a10: "Absolutamente. Muitos prestadores de serviços usam a Nasta para trabalhos extra no seu próprio horário. Você escolhe quando está disponível e quais trabalhos aceitar. Não há horas mínimas ou compromissos.",
  q11: "Quão rápido posso encontrar um trabalhador?",
  a11: "Os empregadores podem usar pedidos instantâneos para encontrar prestadores de serviços verificados e disponíveis por perto em segundos. Para trabalhos agendados, normalmente receberá candidaturas de candidatos qualificados pouco depois de publicar.",
};

// ─── How It Works ───
pt.howItWorks = {
  title: "Como a Nasta Funciona",
  heroLabel: "Como funciona",
  subtitle:
    "Verificado antes do primeiro trabalho. Confiança desde o primeiro dia.",
  heroDesc:
    "Levamos a confiança a sério. Cada utilizador completa um processo de verificação antes de poder publicar ou aceitar um único trabalho. Aqui está exatamente o que é necessário para cada lado.",
  step1Title: "Crie o seu perfil",
  step1Desc:
    "Registe-se, verifique a sua identidade e defina as suas preferências.",
  step2Title: "Peça ou candidate-se",
  step2Desc:
    "Empregadores pedem on-demand. Prestadores candidatam-se com um toque.",
  step3Title: "Conclua e receba",
  step3Desc:
    "Trabalho feito, fundos libertados instantaneamente. Simples e transparente.",
  spBadge: "Prestadores de Serviços",
  spTitle: "Verifique-se uma vez, ganhe para sempre",
  spDesc:
    "Complete a sua verificação para desbloquear pedidos de trabalho instantâneos e começar a ganhar.",
  spFullDesc:
    "Complete a sua verificação para desbloquear pedidos de trabalho instantâneos e começar a ganhar. Cada passo constrói a sua pontuação de confiança e visibilidade para empregadores.",
  spReq0Title: "Verificação de Identidade",
  spReq0Desc:
    "Documento de identificação com foto emitido pelo governo para confirmar a sua identidade real",
  spReq1Title: "Carta de Condução",
  spReq1Desc:
    "Necessária para trabalhos de condução, deve ter sido emitida há pelo menos 3 anos",
  spReq2Title: "Verificação de Antecedentes e Registo Criminal",
  spReq2Desc:
    "Rastreio abrangente para a sua segurança e confiança do empregador",
  spReq3Title: "CV Profissional",
  spReq3Desc: "A sua experiência de trabalho e qualificações em ficheiro",
  spReq4Title: "Competências e Tarifas de Serviço",
  spReq4Desc:
    "Liste as suas competências profissionais com as suas tarifas de serviço em EUR",
  spReq5Title: "Conta Bancária e Configuração de Pagamentos",
  spReq5Desc:
    "Data de nascimento, morada, telefone e email verificados necessários para pagamentos",
  spReq6Title: "Verificação de Telefone e Email",
  spReq6Desc: "Confirmação por SMS e email para proteger a sua conta",
  required: "Obrigatório",
  optional: "Opcional",
  empBadge: "Empregadores",
  empTitle: "Publique o seu primeiro trabalho em minutos",
  empDesc: "Uma configuração mais leve para começar a contratar rapidamente.",
  empFullDesc:
    "Uma configuração mais leve para começar a contratar rapidamente. Adicione o essencial e peça o seu primeiro prestador de serviços hoje.",
  empReq0Title: "Morada Física",
  empReq0Desc:
    "A sua morada empresarial ou residencial para precisão de localização do trabalho",
  empReq1Title: "Número de Telefone",
  empReq1Desc: "Para comunicação direta e segurança da conta",
  empReq2Title: "Verificação de Email e Telefone",
  empReq2Desc: "Confirmação por SMS e email para verificar a sua conta",
  empReq3Title: "Método de Pagamento",
  empReq3Desc:
    "Adicione um cartão para reservar prestadores de serviços e assegurar pagamento em custódia",
  quickStart: "Início rápido:",
  quickStartDesc:
    "Pode navegar por prestadores de serviços verificados imediatamente após criar a sua conta. Adicione a sua morada e verifique o seu telefone para publicar o seu primeiro trabalho ou enviar um pedido instantâneo.",
  trustTitle: "Cada verificação constrói confiança",
  trustDesc:
    "Estes passos existem para proteger todos na plataforma. Prestadores de serviços verificados recebem mais pedidos de trabalho. Empregadores verificados atraem melhor talento.",
  stillHaveQuestions: "Ainda tem dúvidas?",
  stillHaveQuestionsDesc:
    "A nossa equipa está aqui para ajudar. Seja sobre verificação, pagamento, ou qualquer outra coisa, contacte-nos a qualquer momento.",
  contactSupport: "Contactar Suporte",
  viewFAQs: "Ver FAQs",
};

// ─── About page ───
pt.aboutPage = {
  title: "Sobre a Nasta",
  intro:
    "A Nasta é um marketplace de força de trabalho on-demand que conecta prestadores de serviços verificados com empregadores de confiança instantaneamente. Quer precise de alguém agora mesmo para uma tarefa urgente ou queira agendar um contrato de longo prazo, a Nasta torna a contratação rápida, justa e totalmente transparente.",
  missionTitle: "A Nossa Missão",
  missionDesc:
    "Acreditamos que todos merecem acesso instantâneo a oportunidades de trabalho legítimas, e cada empregador merece acesso instantâneo a talento fiável e verificado. A Nasta foi construída para tornar essa conexão instantânea e perfeita, enquanto protege ambos os lados com pagamentos seguros, verificação de identidade e monitorização de trabalho em tempo real.",
  howItWorksTitle: "Como Funciona",
  forSP: "Para Prestadores de Serviços:",
  forSPDesc:
    "Crie um perfil verificado e receba pedidos de trabalho instantâneos perto de si. Use a Nasta como rendimento principal ou trabalho extra flexível, e receba pagamento seguro quando o trabalho estiver feito.",
  forEmp: "Para Empregadores:",
  forEmpDesc:
    "Publique pedidos instantâneos para ajuda on-demand ou agende trabalhos em categorias ilimitadas. Navegue por candidatos verificados, reserve com confiança, e só liberte o pagamento quando estiver satisfeito.",
  trustTitle: "Confiança e Segurança",
  trustDesc:
    "Todos os utilizadores na Nasta são verificados por identidade com documentos emitidos pelo governo. Os pagamentos são retidos em custódia via Stripe até o trabalho estar completo. Rastreamento GPS ao vivo e check-in/check-out digital garantem total responsabilidade em cada tarefa.",
  contactTitle: "Contacte-nos",
  contactDesc: "Tem perguntas? Contacte-nos em",
};

// ─── For Employers page ───
pt.forEmployersPage = {
  heroLabel: "Para Empregadores",
  heroTitle: "Acesso instantâneo a talento verificado",
  heroDesc:
    "Precisa de algo feito agora mesmo? Peça prestadores de serviços verificados e instantaneamente disponíveis on-demand. Todos os trabalhadores são verificados por ID, cada tarefa é monitorizada em tempo real, e cada pagamento é protegido pela custódia Stripe.",
  whyTitle: "Porque é que os empregadores escolhem a Nasta",
  benefit0Title: "Trabalhadores Verificados por ID",
  benefit0Desc:
    "Todos os prestadores de serviços passam por verificação de ID governamental antes de poderem aceitar qualquer tarefa. Sabe sempre exatamente quem vai aparecer.",
  benefit1Title: "Pagamentos Seguros em Custódia",
  benefit1Desc:
    "O seu dinheiro é mantido seguro pelo Stripe até o trabalho estar marcado como concluído. Só liberta o pagamento quando estiver satisfeito com o trabalho.",
  benefit2Title: "Monitorização em Tempo Real",
  benefit2Desc:
    "Rastreamento GPS ao vivo e check-in/check-out digital para cada tarefa. Visibilidade total do início ao fim, para que nunca haja surpresas.",
  benefit3Title: "Pedidos Instantâneos",
  benefit3Desc:
    "Precisa de ajuda agora? Publique um pedido instantâneo e seja correspondido com prestadores de serviços verificados e disponíveis perto de si. Ou agende para trabalho planeado.",
  benefit4Title: "Avaliações e Comentários",
  benefit4Desc:
    "Veja o histórico de cada prestador de serviços antes de reservar. Avaliações verificadas de empregadores reais ajudam-no a tomar decisões confiantes.",
  benefit5Title: "Categorias Ilimitadas",
  benefit5Desc:
    "Da limpeza e cuidado de crianças à construção e eventos. Publique qualquer tipo de trabalho em categorias de serviço ilimitadas.",
  howTitle: "Como funciona",
  step0Title: "Publique ou peça instantaneamente",
  step0Desc:
    "Precisa de ajuda agora? Use o pedido instantâneo para encontrar prestadores disponíveis por perto. Ou publique um trabalho agendado para mais tarde. Demora menos de dois minutos.",
  step1Title: "Seja correspondido com talento verificado",
  step1Desc:
    "Prestadores de serviços instantaneamente disponíveis são correspondidos com o seu pedido. Todos são verificados por ID com avaliações, comentários e experiência verificada.",
  step2Title: "Reserve, monitorize e pague",
  step2Desc:
    "Reserve com confiança. Acompanhe a tarefa em tempo real. Liberte o pagamento apenas quando o trabalho atende aos seus padrões.",
  reqTitle: "O que precisa para começar",
  reqDesc:
    "Uma configuração rápida para começar a contratar rápido. Adicione o essencial e peça o seu primeiro prestador de serviços hoje.",
  req0Title: "Morada Física",
  req0Desc:
    "A sua morada empresarial ou residencial para precisão de localização do trabalho",
  req1Title: "Número de Telefone",
  req1Desc: "Para comunicação direta e segurança da conta",
  req2Title: "Verificação de Email e Telefone",
  req2Desc: "Confirmação por SMS e email para verificar a sua conta",
  req3Title: "Método de Pagamento",
  req3Desc:
    "Adicione um cartão para reservar prestadores de serviços e assegurar pagamento em custódia",
  required: "Obrigatório",
  optional: "Opcional",
  protectedTitle: "O seu dinheiro está protegido",
  protectedP1:
    "Quando reserva um prestador de serviços, o pagamento é assegurado na custódia Stripe antes do início do trabalho. O prestador de serviços pode ver que o pagamento está assegurado, mas não pode aceder aos fundos.",
  protectedP2:
    "Assim que o trabalho estiver completo e confirmar a sua satisfação, os fundos são libertados. Se houver uma disputa, a nossa equipa analisa o caso com registos GPS completos, registos de check-in/check-out e histórico de comunicação.",
  protectedP3:
    "A Nasta cobra uma pequena comissão de plataforma para cobrir processamento de pagamentos, verificação de identidade e infraestrutura de monitorização. Nunca paga mais do que o preço acordado do trabalho.",
  ctaTitle: "Pronto para contratar?",
  ctaDesc:
    "Crie uma conta de empregador gratuita e publique o seu primeiro trabalho em minutos.",
  ctaButton: "Criar Conta de Empregador",
};

// ─── For Service Providers page ───
pt.forServiceProvidersPage = {
  heroLabel: "Para Prestadores de Serviços",
  heroTitle: "Ganhe instantaneamente. Nos seus termos.",
  heroDesc:
    "Quer seja o seu rendimento principal ou um trabalho extra, a Nasta conecta-o com pedidos de trabalho instantâneos de empregadores verificados. Receba rapidamente, trabalhe no seu horário e construa a sua reputação.",
  whyTitle: "Porque é que os prestadores de serviços escolhem a Nasta",
  benefit0Title: "Pagamentos Instantâneos",
  benefit0Desc:
    "Os fundos são libertados assim que o trabalho é marcado como concluído. Sem faturas, sem atrasos. Pagamentos instantâneos diretamente na sua conta, perfeito para rendimento extra.",
  benefit1Title: "Pagamento Garantido",
  benefit1Desc:
    "Cada trabalho é apoiado pela custódia Stripe. O pagamento do empregador é assegurado antes de começar, para que tenha garantia de ser pago pelo trabalho concluído.",
  benefit2Title: "Empregadores Verificados",
  benefit2Desc:
    "Todos os empregadores na Nasta também são verificados. Sabe sempre para quem está a trabalhar, com detalhes de trabalho transparentes e termos justos.",
  benefit3Title: "Categorias Ilimitadas",
  benefit3Desc:
    "Limpeza, cuidado de crianças, construção, eventos, tutoria e mais. Aceite trabalhos instantâneos em qualquer categoria, seja como trabalho principal ou extra.",
  benefit4Title: "Mobile First",
  benefit4Desc:
    "Receba notificações de trabalho instantâneas, candidate-se com um toque, converse com empregadores e acompanhe os seus ganhos. App completa para iOS e Android.",
  benefit5Title: "Construa a Sua Reputação",
  benefit5Desc:
    "Cada trabalho concluído ganha-lhe avaliações e comentários. Um perfil forte significa mais reservas, melhores trabalhos e maiores ganhos ao longo do tempo.",
  howTitle: "Como funciona",
  step0Title: "Crie o seu perfil",
  step0Desc:
    "Registe-se gratuitamente, verifique a sua identidade com um documento de identificação governamental e configure as suas competências e disponibilidade. Demora menos de cinco minutos.",
  step1Title: "Receba pedidos de trabalho instantâneos",
  step1Desc:
    "Receba notificações em tempo real para trabalhos perto de si que correspondam às suas competências. Aceite com um toque, ou navegue e candidate-se no seu horário.",
  step2Title: "Trabalhe e receba",
  step2Desc:
    "Complete a tarefa, faça check-out digitalmente, e os fundos são libertados para a sua conta de pagamento. Simples, rápido, transparente.",
  verifyTitle: "Verifique-se uma vez, ganhe para sempre",
  verifyDesc:
    "Complete a sua verificação para desbloquear pedidos de trabalho instantâneos e começar a ganhar. Cada passo constrói a sua pontuação de confiança e visibilidade.",
  req0Title: "Verificação de Identidade",
  req0Desc:
    "Documento de identificação com foto emitido pelo governo para confirmar a sua identidade real",
  req1Title: "Carta de Condução",
  req1Desc:
    "Necessária para trabalhos de condução, deve ter sido emitida há pelo menos 3 anos",
  req2Title: "Verificação de Antecedentes e Registo Criminal",
  req2Desc:
    "Rastreio abrangente para a sua segurança e confiança do empregador",
  req3Title: "CV Profissional",
  req3Desc: "A sua experiência de trabalho e qualificações em ficheiro",
  req4Title: "Competências e Tarifas de Serviço",
  req4Desc:
    "Liste as suas competências profissionais com as suas tarifas de serviço em EUR",
  req5Title: "Conta Bancária e Configuração de Pagamentos",
  req5Desc:
    "Data de nascimento, morada, telefone e email verificados necessários para pagamentos",
  req6Title: "Verificação de Telefone e Email",
  req6Desc: "Confirmação por SMS e email para proteger a sua conta",
  required: "Obrigatório",
  protectedTitle: "Os seus ganhos estão protegidos",
  protectedP1:
    "Antes de iniciar qualquer trabalho, o pagamento do empregador já está assegurado na custódia Stripe. Quer este seja o seu trabalho a tempo inteiro ou um extra, nunca fará trabalho sem a garantia de ser pago.",
  protectedP2:
    "Assim que o trabalho estiver completo e confirmado, os seus ganhos são libertados diretamente para a sua conta de pagamento conectada. A maioria dos pagamentos chega em 1-2 dias úteis.",
  protectedP3:
    "A Nasta cobra uma pequena comissão de plataforma por cada trabalho concluído para cobrir processamento de pagamentos e operações da plataforma. Vê sempre o valor exato que vai ganhar antes de aceitar um trabalho.",
  ctaTitle: "Pronto para começar a ganhar?",
  ctaDesc:
    "Crie uma conta gratuita, verifique a sua identidade e comece a candidatar-se a trabalhos hoje.",
  ctaButton: "Criar Conta Gratuita",
};

// ─── Support page (web) ───
pt.supportPage = {
  title: "Suporte",
  subtitle:
    "Precisa de ajuda? Estamos aqui por si. Escolha um tópico abaixo ou envie-nos uma mensagem.",
  faqsTitle: "Perguntas Frequentes",
  faqsDesc: "Consulte perguntas comuns",
  deleteAccountTitle: "Eliminar Conta",
  deleteAccountDesc: "Pedir eliminação permanente",
  contactUsTitle: "Contacte-nos",
  contactUsDesc: "Para suporte geral ou questões de política",
  department: "Departamento",
  generalSupport: "Suporte Geral",
  policyLegal: "Política e Legal",
  sendingTo: "A enviar para",
  name: "Nome",
  email: "Email",
  subject: "Assunto",
  message: "Mensagem",
  sendMessage: "Enviar Mensagem",
  openingEmailClient: "A abrir cliente de email...",
  namePlaceholder: "O seu nome completo",
  emailPlaceholder: "voce@exemplo.com",
  subjectPlaceholder: "Breve resumo da sua questão",
  messagePlaceholder: "Descreva a sua questão ou problema em detalhe...",
  featureRequestTitle: "Pedido de Funcionalidade",
  featureRequestDesc:
    "Sugira uma nova funcionalidade ou melhoria. Envia para feature-request@nasta.app",
  featureTitle: "Título da Funcionalidade",
  description: "Descrição",
  submitRequest: "Submeter Pedido",
  featureTitlePlaceholder:
    "ex. Adicionar agendamento para trabalhos recorrentes",
  descriptionPlaceholder:
    "Descreva a funcionalidade, porque seria útil, e quaisquer detalhes que nos ajudem a compreender a sua ideia...",
};

// ─── Write files ───
writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n", "utf8");
writeFileSync(ptPath, JSON.stringify(pt, null, 2) + "\n", "utf8");

console.log("✅ EN keys:", Object.keys(en).length);
console.log("✅ PT keys:", Object.keys(pt).length);
console.log("✅ Translations added successfully!");
