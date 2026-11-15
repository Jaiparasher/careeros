// Cloud and AI Foundations: 6 total
// aws-foundations (6)
module.exports = function(addQ) {
  addQ({
    id: "aws-01",
    skill_slug: "aws-foundations",
    skill_name: "AWS Foundations / AI Practitioner Concepts",
    skill_category: "cloud-ai",
    topic: "Cloud shared responsibility",
    subtopic: "AWS Shared Responsibility Model",
    question_title: "Explain the AWS Shared Responsibility Model for Security and Compliance.",
    question_prompt: "What is AWS responsible for ('Security OF the Cloud') versus what is the Customer responsible for ('Security IN the Cloud')? Compare across IaaS (EC2), PaaS (RDS, Elastic Beanstalk), and Serverless/SaaS (S3, Lambda).",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "AWS Responsibility ('Security OF the Cloud'): Physical security of data centers, hardware infrastructure, virtualization hypervisors, physical networking, power, and facilities.",
      "Customer Responsibility ('Security IN the Cloud'): Guest OS patching (on EC2), network firewall rules (Security Groups, NACLs), IAM identity and access policies, application code, data encryption at rest and in transit.",
      "Shift with Managed Services (PaaS/Serverless): For RDS and Lambda, AWS takes over OS patching and runtime maintenance; the customer is only responsible for data, IAM permissions, and application configuration."
    ],
    sample_answer: "The AWS Shared Responsibility Model divides security ownership: AWS owns 'Security OF the Cloud' (securing physical data centers, host hardware, cables, and virtualization hypervisors). The customer owns 'Security IN the Cloud' (managing IAM credentials, configuring security groups, encrypting sensitive data, and patching guest operating systems). With managed and serverless services like RDS or Lambda, AWS assumes responsibility for operating system and runtime patches, leaving only data and application security to the customer.",
    follow_up_questions: [
      "Who is responsible for encrypting customer data stored in Amazon S3?",
      "How does the model apply to Amazon Elastic Kubernetes Service (EKS) control plane vs worker nodes?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "aws-02",
    skill_slug: "aws-foundations",
    skill_name: "AWS Foundations / AI Practitioner Concepts",
    skill_category: "cloud-ai",
    topic: "IAM and security basics",
    subtopic: "AWS IAM: Users, Roles, Policies, and Least Privilege",
    question_title: "How does AWS Identity and Access Management (IAM) enforce Least Privilege?",
    question_prompt: "Compare IAM Users, Groups, and IAM Roles. Why should EC2 instances and Lambda functions assume IAM Roles rather than storing long-lived access keys in code? How do IAM Policies evaluate allow/deny rules?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "IAM User: Identity with long-term credentials (password, access key ID + secret access key). Intended for human operators.",
      "IAM Role: Identity with NO long-term credentials. Assumed dynamically by trusted entities (EC2 instances, Lambda functions, ECS tasks) using AWS Security Token Service (STS) to obtain temporary, auto-rotating 1-hour credentials.",
      "Security best practice: Never store static AWS access keys inside application source code, Dockerfiles, or configuration files; attach IAM Roles (Instance Profiles).",
      "Policy evaluation: Explicit DENY always trumps any ALLOW. Default decision is implicit deny."
    ],
    sample_answer: "IAM manages authentication and authorization in AWS. IAM Users have permanent credentials and are intended for human developers. IAM Roles have no permanent keys; they are assumed dynamically by services (like EC2 or Lambda) via AWS STS to receive temporary, automatically rotating session credentials. Applications must never hardcode access keys; instead, assign an IAM Role to the compute instance. In IAM policy evaluation, an explicit Deny always overrides an Allow, and all ungranted actions default to Deny.",
    follow_up_questions: [
      "What is the difference between an IAM Identity-Based Policy and a Resource-Based Policy (like an S3 Bucket Policy)?",
      "What is AWS STS AssumeRole and how is it used in cross-account access?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "aws-03",
    skill_slug: "aws-foundations",
    skill_name: "AWS Foundations / AI Practitioner Concepts",
    skill_category: "cloud-ai",
    topic: "Core cloud service categories",
    subtopic: "Core AWS Infrastructure: VPC, EC2, S3, and RDS",
    question_title: "Explain the architecture of a secure Virtual Private Cloud (VPC) in AWS.",
    question_prompt: "Design a standard multi-AZ VPC: Public Subnets (Internet Gateway, NAT Gateway) vs Private Subnets (App servers, RDS). How do Security Groups (stateful) and Network ACLs (stateless) enforce network boundaries?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "VPC (Virtual Private Cloud): Isolated private virtual network in an AWS region.",
      "Public Subnets: Have route table entry pointing to Internet Gateway (0.0.0.0/0 -> igw). Hosts internet-facing load balancers (ALB) and NAT Gateways.",
      "Private Subnets: Have route table entry pointing to NAT Gateway for outbound internet (updates/patches), but NO public inbound IPs. Hosts backend application servers and databases.",
      "Security Groups: Stateful virtual firewall at instance/ENI level (allowing inbound port 443 automatically allows the outbound response).",
      "Network ACLs (NACL): Stateless subnet-level firewall with numbered allow/deny rules (requires explicit inbound AND outbound rules)."
    ],
    sample_answer: "A secure VPC spans multiple Availability Zones for high availability. Public subnets route through an Internet Gateway and host external load balancers and NAT Gateways. Private subnets have no direct public IPs and host backend microservices and databases, routing outbound traffic through the NAT Gateway. Security Groups act as stateful instance-level firewalls (allowing inbound traffic automatically allows return traffic). Network ACLs provide a stateless second layer of defense at the subnet boundary.",
    follow_up_questions: [
      "Why must databases like Amazon RDS always be placed in Private Subnets?",
      "What is an AWS VPC Endpoint (PrivateLink) and how does it access S3 without traversing the public internet?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "aws-04",
    skill_slug: "aws-foundations",
    skill_name: "AWS Foundations / AI Practitioner Concepts",
    skill_category: "cloud-ai",
    topic: "ML and generative AI fundamentals",
    subtopic: "Generative AI vs Traditional Machine Learning",
    question_title: "Compare Generative AI Foundation Models with Traditional Machine Learning.",
    question_prompt: "Explain the transition from discriminative machine learning (classification, regression) to generative AI foundation models (LLMs, Diffusion). What is the Transformer architecture and self-attention mechanism?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Traditional ML / Discriminative AI: Models P(Y|X). Learns decision boundaries to classify data or predict continuous numerical values (e.g. spam detection, loan default prediction, sentiment classification). Requires task-specific labeled data.",
      "Generative AI / Foundation Models: Models P(X) or next token probability. Trained on massive unlabelled corpora (self-supervised learning) to generate new, original content (text, code, images).",
      "Transformer Architecture (Vaswani et al., 2017): Replaced recurrent networks (RNN/LSTM) by eliminating sequential processing. Key innovation: Self-Attention mechanism allows models to compute contextual relationships between all words in a sequence in parallel on GPUs."
    ],
    sample_answer: "Traditional machine learning focuses on classification and regression (discriminative models predicting labels from features using task-specific training data). Generative AI models generate new text, code, or media by predicting underlying probability distributions. Foundation models (LLMs) are powered by the Transformer architecture: its self-attention mechanism processes entire text sequences simultaneously rather than sequentially, allowing the model to capture deep semantic dependencies across long contexts efficiently on GPUs.",
    follow_up_questions: [
      "What is the difference between Fine-Tuning, Prompt Engineering, and RAG for adapting LLMs?",
      "What is catastrophic forgetting during model fine-tuning?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "aws-05",
    skill_slug: "aws-foundations",
    skill_name: "AWS Foundations / AI Practitioner Concepts",
    skill_category: "cloud-ai",
    topic: "Responsible AI and governance",
    subtopic: "Responsible AI, Bias, and Safety Guardrails",
    question_title: "What are the core pillars of Responsible AI in enterprise applications?",
    question_prompt: "Explain Responsible AI principles: Fairness and Bias mitigation, Explainability/Transparency, Privacy and Data Protection (PII masking), and Safety Guardrails against toxic content and jailbreaking.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "1. Fairness & Bias: Mitigating demographic and socioeconomic biases in training data and model outputs.",
      "2. Transparency & Explainability: Providing clear disclosure when users interact with AI; ability to trace why specific outputs were generated.",
      "3. Privacy & Data Governance: Preventing training data memorization; ensuring user prompts do not leak into general training sets; automated PII redaction (masking SSNs, credit cards).",
      "4. Robustness & Safety Guardrails: Defending against Prompt Injection and Jailbreaking; filtering hate speech, self-harm, and proprietary data leakage (e.g. AWS Bedrock Guardrails, NeMo Guardrails)."
    ],
    sample_answer: "Responsible AI requires deploying models that are fair, transparent, and secure. Core pillars include: Fairness (identifying and mitigating demographic bias in outputs), Privacy (redacting personally identifiable information and ensuring enterprise prompt data is not used for model retraining), Transparency (disclosing AI involvement and citing reference grounding), and Safety Guardrails (filtering harmful content and deploying input/output guardrails against prompt injection and jailbreak attacks).",
    follow_up_questions: [
      "What is Prompt Injection and how does an indirect prompt injection attack work?",
      "How do enterprise services like Amazon Bedrock Guardrails filter PII and toxic content?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "aws-06",
    skill_slug: "aws-foundations",
    skill_name: "AWS Foundations / AI Practitioner Concepts",
    skill_category: "cloud-ai",
    topic: "Core cloud service categories",
    subtopic: "Amazon Bedrock & Managed Foundation Models",
    question_title: "How does Amazon Bedrock provide managed access to Foundation Models?",
    question_prompt: "What is Amazon Bedrock? Explain how it provides serverless API access to leading models (Claude, Llama, Titan) without provisioning GPUs, and how Knowledge Bases for Amazon Bedrock implements managed RAG.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "low",
    expected_answer_points: [
      "Amazon Bedrock: Fully managed serverless service providing unified API access to foundation models from multiple AI companies (Anthropic Claude, Meta Llama, Mistral, Amazon Titan).",
      "Serverless: No GPU provisioning, cluster scaling, or infrastructure management required; pay-per-token pricing.",
      "Data privacy: User enterprise data is encrypted in transit and at rest; customer data is NOT used to train the base foundation models.",
      "Knowledge Bases for Bedrock: Fully managed RAG service. Connects to Amazon S3 data sources, chunks and embeds documents into a vector database (OpenSearch Serverless, Pinecone, or pgvector), and automates retrieval at query time."
    ],
    sample_answer: "Amazon Bedrock is a fully managed serverless platform providing unified API access to foundation models from Anthropic, Meta, Mistral, and Amazon without requiring GPU infrastructure management. It guarantees data privacy by never training public base models on customer prompt data. Its 'Knowledge Bases' feature automates the entire RAG pipeline: syncing enterprise documents from S3, generating embeddings, storing them in a managed vector database, and injecting relevant context into prompts automatically.",
    follow_up_questions: [
      "How do Bedrock Agents orchestrate multi-step tool execution and API calls?",
      "What is the difference between On-Demand pricing and Provisioned Throughput in Amazon Bedrock?"
    ],
    estimated_minutes: 10
  });
};
