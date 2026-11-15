// Developer Tools and Delivery questions: 44 total
// docker (10), kubernetes (8), git-github (7), maven (6), cicd (7), agile-scrum (6)
module.exports = function(addQ) {
  // --- DOCKER (10) ---
  addQ({
    id: "doc-01",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Images and containers",
    subtopic: "Containers vs Virtual Machines",
    question_title: "Explain the architectural difference between Containers and Virtual Machines (VMs).",
    question_prompt: "How does Docker achieve lightweight virtualization compared to a Hypervisor? Explain Linux kernel namespaces (PID, NET, MNT, IPC), cgroups (resource limits), and chroot/pivot_root.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Virtual Machines (Type 1/Type 2 Hypervisor): Virtualizes physical hardware; each VM runs a full guest operating system with its own kernel, binaries, and gigabytes of RAM overhead.",
      "Containers: Virtualizes at the OS level; shares the host OS kernel.",
      "Linux Namespaces: Provide isolation (PID isolates processes, NET isolates network interfaces, MNT isolates filesystem mounts, IPC isolates inter-process communication).",
      "Control Groups (cgroups): Enforce resource metering and limits (capping CPU shares, memory limits, I/O bandwidth).",
      "Performance: Containers boot in milliseconds, use megabytes of RAM, and achieve near bare-metal CPU throughput."
    ],
    sample_answer: "Virtual Machines use a hypervisor to virtualize hardware, requiring each VM to run a separate guest OS kernel with heavy RAM and boot time overhead. Docker containers share the host Linux kernel, achieving process-level isolation through Linux kernel features: Namespaces provide isolation (PID for processes, NET for networking, MNT for filesystem), while cgroups enforce CPU and memory resource limits. Containers start in milliseconds with near zero virtualization overhead.",
    follow_up_questions: [
      "Can a Linux-based Docker container run natively on a Windows kernel without a VM (WSL2)?",
      "What is the difference between a Docker Image and a Docker Container?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "doc-02",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Multi-stage builds",
    subtopic: "Multi-Stage Docker Builds",
    question_title: "How do Multi-Stage Docker Builds optimize production image size and security?",
    question_prompt: "Walk through writing a multi-stage Dockerfile for a Spring Boot or Next.js application: Build stage with Maven/Node SDK vs Production runtime stage with JRE/Distroless. Why is shipping the JDK to production an anti-pattern?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Problem with single-stage: Image includes compiler tools (Maven, JDK, gcc, node_modules build devDependencies), resulting in 1GB+ image sizes and vast CVE vulnerability attack surfaces.",
      "Multi-stage syntax: 'FROM maven:3.9-eclipse-temurin-17 AS builder' -> compiles JAR.",
      "Second stage: 'FROM eclipse-temurin:17-jre-alpine' or 'FROM gcr.io/distroless/java17-debian12'.",
      "COPY --from=builder /app/target/app.jar app.jar.",
      "Benefits: Drops image size from 800MB to 120MB, eliminates build tools and source code from production image, minimizing security vulnerabilities."
    ],
    sample_answer: "Multi-stage builds use multiple 'FROM' statements in a single Dockerfile. The first stage uses a heavy build image (with Maven/JDK or Node.js) to compile the code. The final stage starts from a minimal runtime base (like Alpine JRE or Google Distroless) and copies only the compiled artifact (the JAR or standalone bundle) using `COPY --from=builder`. This shrinks image sizes from 1GB down to ~100MB and removes compilers and package managers, drastically reducing the CVE security attack surface.",
    follow_up_questions: [
      "What is Google Distroless and why does it have no package manager (apt) or shell (bash)?",
      "How do you inspect the individual layers and sizes of a Docker image using docker history?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "doc-03",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Dockerfile layers and caching",
    subtopic: "Docker Layer Caching Best Practices",
    question_title: "How does Docker Layer Caching work, and how should a Dockerfile be ordered for maximum cache hits?",
    question_prompt: "Explain copy-on-write (OverlayFS) layers. Why should pom.xml / package.json be copied and installed BEFORE copying application source code?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Every instruction (RUN, COPY, ADD) in a Dockerfile creates a read-only filesystem layer cached by hash.",
      "Cache invalidation rule: If a layer changes, that layer and ALL subsequent layers must be rebuilt from scratch.",
      "Optimization strategy: Order instructions from least-frequently changing to most-frequently changing.",
      "Best practice: COPY package.json package-lock.json ./ -> RUN npm ci -> COPY . .",
      "If you COPY source code first, every minor code edit invalidates the cache, forcing npm install / mvn dependency:go-offline to re-download dependencies on every single build."
    ],
    sample_answer: "Docker images are stacks of read-only cached layers. When an instruction's inputs change, Docker invalidates that layer's cache and rebuilds every layer that follows. To maximize caching, place rarely changing dependencies before frequently changing business code: copy package.json / pom.xml and run the package install first, then copy the rest of the source code. This ensures dependencies remain cached across code changes, speeding up CI builds from minutes to seconds.",
    follow_up_questions: [
      "What is the difference between ADD and COPY in a Dockerfile?",
      "Why should RUN commands be chained with '&&' (e.g. apt-get update && apt-get install ... && rm -rf /var/lib/apt/lists/*)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "doc-04",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Container security and environment configuration",
    subtopic: "Non-Root Users & Container Security",
    question_title: "Why should containers never run as root, and how do you configure a non-root user?",
    question_prompt: "What is the security danger of running container processes as root (UID 0)? How do you create and switch to a non-privileged user in a Dockerfile using USER instruction?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Root vulnerability: By default, Docker containers run as root (UID 0). If a container breakout vulnerability occurs (e.g. kernel exploit or mounted docker.sock), the attacker gains root privileges on the underlying host machine.",
      "Fix: Create a system group and user in the Dockerfile: RUN addgroup -S appgroup && adduser -S appuser -G appgroup.",
      "Grant file permissions: RUN chown -R appuser:appgroup /app.",
      "Switch user: USER appuser.",
      "Security compliance: Mandated by CIS Docker benchmarks and Kubernetes SecurityContext (runAsNonRoot: true)."
    ],
    sample_answer: "By default, container processes run as root (UID 0). If an application vulnerability allows container escape, the attacker gains full root access on the host operating system. To secure containers, create a dedicated system group and user in the Dockerfile (RUN adduser -S appuser), change ownership of application directories, and declare 'USER appuser'. This adheres to the principle of least privilege, preventing an escaped process from compromising the host.",
    follow_up_questions: [
      "How does Kubernetes enforce non-root containers using PodSecurityStandards / SecurityContext?",
      "What is readOnlyRootFilesystem and why is it recommended for production containers?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "doc-05",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Volumes and networks",
    subtopic: "Docker Storage: Bind Mounts vs Named Volumes",
    question_title: "Compare Named Volumes, Bind Mounts, and tmpfs in Docker storage.",
    question_prompt: "When should you use Docker Named Volumes versus Bind Mounts versus tmpfs? How is database persistence managed in stateful containers (PostgreSQL/MySQL)?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Named Volumes (-v mydata:/var/lib/postgresql/data): Managed exclusively by Docker in /var/lib/docker/volumes. Isolated from host filesystem details. Safe for database persistence, high performance, easily backed up and migrated.",
      "Bind Mounts (-v /host/path:/container/path): Mounts an exact host directory/file into the container. Dependent on host directory structure and permissions. Best for local development (hot reload / mounting source code).",
      "tmpfs mount (--tmpfs /app/cache): Stored purely in host system memory (RAM). Never written to disk. Best for sensitive temporary secrets or ultra-fast ephemeral caches."
    ],
    sample_answer: "Named Volumes are managed entirely by Docker within Docker-controlled host storage (/var/lib/docker/volumes), providing optimal I/O performance and filesystem isolation for persistent state like databases. Bind Mounts link an exact host file or folder into the container, ideal for local development hot-reloading. tmpfs mounts write directly to host RAM without touching disk, perfect for storing ephemeral secrets or temporary caches that must not persist.",
    follow_up_questions: [
      "What happens to data inside an unmounted container when the container is deleted (docker rm)?",
      "How do volume drivers enable network-attached storage (NFS, AWS EBS) in Docker?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "doc-06",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Volumes and networks",
    subtopic: "Docker Networking: Bridge, Host, and Overlay",
    question_title: "Explain Docker Network drivers: Bridge, Host, Overlay, and None.",
    question_prompt: "How does the default Bridge network provide container DNS resolution and port mapping (-p 8080:80)? Compare Bridge with Host networking and multi-host Overlay networks.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Bridge network (default): Creates a virtual bridge (docker0) on the host. Containers receive private IP addresses (172.17.x.x) and use iptables NAT for outbound access.",
      "Custom user-defined bridge: Enables built-in Docker DNS service discovery (containers ping each other by container name, e.g. 'http://postgres:5432').",
      "Port mapping (-p 8080:80): Binds host port 8080 to container port 80 via iptables NAT forwarding rules.",
      "Host network (--net=host): Disables network isolation; container shares host network stack directly (no port mapping needed, maximum throughput, but port conflicts possible).",
      "Overlay network: Enables multi-host networking across Docker Swarm nodes using VXLAN tunnels."
    ],
    sample_answer: "The Bridge network assigns containers private IPs behind a virtual bridge interface, using iptables NAT to forward host ports (-p 8080:80). On custom user-defined bridge networks, Docker provides automatic internal DNS discovery by container name. Host networking (--net=host) bypasses network virtualization entirely, running directly on the host network interfaces for maximum speed at the cost of port conflict isolation. Overlay networks route traffic across multiple cluster hosts via VXLAN encapsulation.",
    follow_up_questions: [
      "Why doesn't the default 'bridge' network support automatic DNS resolution by container name while user-defined bridges do?",
      "How does Docker port publishing interact with the host UFW / iptables firewall?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "doc-07",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Container security and environment configuration",
    subtopic: "ENTRYPOINT vs CMD in Dockerfile",
    question_title: "What is the difference between ENTRYPOINT and CMD in a Dockerfile?",
    question_prompt: "Explain how ENTRYPOINT and CMD interact. Compare Exec form (JSON array [\"executable\", \"param\"]) with Shell form (\"executable param\"), and explain why Shell form breaks SIGTERM signal propagation.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "ENTRYPOINT: Defines the immutable fixed binary to execute (e.g. ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]).",
      "CMD: Provides default arguments that can be easily overridden by command-line arguments when running the container (docker run myimage --server.port=9090).",
      "Exec form ([\"executable\", \"param\"]): Preferred standard. Executes the binary directly as PID 1.",
      "Shell form (executable param): Wraps command in /bin/sh -c. The shell process becomes PID 1, and the application becomes a child process.",
      "Signal issue: Shell form absorbs SIGTERM signals without forwarding them to the child app, preventing graceful shutdown."
    ],
    sample_answer: "ENTRYPOINT specifies the core executable that runs when the container starts, while CMD provides default parameters that can be overridden by passing arguments to `docker run`. Always use Exec form (JSON array e.g. [\"node\", \"server.js\"]) rather than Shell form. Shell form spawns a shell (/bin/sh -c) as PID 1: this prevents Unix signals (like SIGTERM on docker stop) from reaching your application process, breaking graceful shutdown and causing forced SIGKILLs.",
    follow_up_questions: [
      "What is dumb-init or tini and why is an init process sometimes required in containers?",
      "How do you override the ENTRYPOINT at runtime using docker run --entrypoint?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "doc-08",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Container security and environment configuration",
    subtopic: "Docker Compose Multi-Container Architecture",
    question_title: "How do you orchestrate local multi-container environments using Docker Compose?",
    question_prompt: "Explain docker-compose.yml: services, networks, volumes, depends_on (with condition: service_healthy), and environment variables (.env interpolation).",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Docker Compose: Tool for defining and running multi-container applications locally using YAML.",
      "services: Defines container configurations (backend, db, redis, kafka).",
      "Automatic networking: Compose creates a default user-defined bridge network; all services resolve each other by service name (e.g. spring app connects to 'jdbc:postgresql://db:5432/mydb').",
      "depends_on with healthcheck: 'depends_on: db: condition: service_healthy' ensures backend doesn't start until PostgreSQL completes initialization and responds to pg_isready.",
      "Environment files: Automatically interpolates variables from .env into docker-compose.yml."
    ],
    sample_answer: "Docker Compose orchestrates multi-container applications via YAML. It automatically creates a shared bridge network where services resolve each other by service name (e.g. connecting to 'postgres:5432'). To prevent race conditions where a backend starts before a database is ready to accept connections, configure a healthcheck on the database and specify 'depends_on: { db: { condition: service_healthy } }'. Variable interpolation pulls credentials securely from local .env files.",
    follow_up_questions: [
      "Why is depends_on alone without condition: service_healthy insufficient for database dependencies?",
      "What is the difference between docker compose up, docker compose down, and docker compose down -v?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "doc-09",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Images and containers",
    subtopic: "Docker Image Scanning & Vulnerability Management",
    question_title: "How do you scan Docker images for security vulnerabilities in CI/CD?",
    question_prompt: "Explain automated vulnerability scanning using Trivy or Docker Scout. What are Common Vulnerabilities and Exposures (CVEs), and how do you fail a CI pipeline if CRITICAL vulnerabilities are detected?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Container vulnerability scanning: Analyzes OS package databases (apk, apt) and application dependencies (pom.xml, package.json) inside image layers against CVE databases (NVD).",
      "Trivy CLI: trivy image --severity HIGH,CRITICAL --exit-code 1 myapp:latest.",
      "CI/CD Integration: Adding scanning step after docker build. If exit-code 1 is returned due to critical CVEs, the pipeline fails and blocks pushing to Docker Hub / ECR.",
      "Remediation: Upgrade base image (e.g. alpine:3.19 -> 3.20), bump library dependencies, or use Distroless images containing zero OS package managers."
    ],
    sample_answer: "Security scanners like Trivy or Docker Scout inspect image filesystem layers for known CVE vulnerabilities in OS packages and language libraries. In CI/CD pipelines, configure Trivy to run after the image build with severity flags (e.g. --severity HIGH,CRITICAL --exit-code 1). If a critical vulnerability is detected, Trivy exits with code 1, automatically failing the build and preventing compromised containers from reaching container registries.",
    follow_up_questions: [
      "What is an SBOM (Software Bill of Materials) and how does syft generate one?",
      "Why do minimal base images (Alpine, Chainguard, Distroless) dramatically reduce reported CVE counts?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "doc-10",
    skill_slug: "docker",
    skill_name: "Docker",
    skill_category: "devops-tools",
    topic: "Container security and environment configuration",
    subtopic: "JVM Container Awareness & Memory Limits",
    question_title: "How does the Java Virtual Machine (JVM) detect Docker memory and CPU limits?",
    question_prompt: "Why did Java 8 apps crash with OOMKilled in early Docker environments? Explain JVM container awareness (-XX:+UseContainerSupport, -XX:MaxRAMPercentage) and CPU cgroup quota detection.",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Old behavior (Java 8u131 and earlier): JVM was unaware of cgroups; Runtime.getRuntime().maxMemory() inspected the HOST physical RAM (e.g. 64GB) instead of the container limit (e.g. 1GB). Default MaxHeap was 1/4 of host RAM (16GB), causing Linux kernel OOM killer to immediately terminate the container.",
      "Container awareness (Java 10+ and backported to Java 8u191+): -XX:+UseContainerSupport enabled by default.",
      "JVM reads cgroup memory limits (/sys/fs/cgroup/memory/memory.limit_in_bytes) and adjusts heap dynamically.",
      "Best practice configuration: -XX:MaxRAMPercentage=75.0 (allocates 75% of container RAM to heap, leaving 25% for Metaspace, thread stacks, and native buffers).",
      "CPU quota: Detects cgroup cpu.cfs_quota_us to size ForkJoinPool and GC worker threads accurately."
    ],
    sample_answer: "Older JVMs inspected host hardware rather than container cgroup limits. In a container restricted to 1GB RAM on a 64GB host, Java allocated a default heap of 16GB, causing the Linux kernel OOM-killer to instantly terminate the pod. Modern Java (with -XX:+UseContainerSupport) reads cgroup limits directly. The recommended production setting is -XX:MaxRAMPercentage=75.0, which dynamically sizes the heap to 75% of the container's memory limit, leaving 25% for native memory and thread stacks.",
    follow_up_questions: [
      "What is the Linux OOM Killer and exit code 137 in Docker containers?",
      "Why must container memory limits allow headroom beyond the JVM heap (-Xmx) size?"
    ],
    estimated_minutes: 12
  });

  // --- KUBERNETES (8) ---
  addQ({
    id: "k8s-01",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Pods, Deployments and ReplicaSets",
    subtopic: "Kubernetes Architecture & Control Plane",
    question_title: "Explain the architecture of a Kubernetes Cluster: Control Plane and Worker Nodes.",
    question_prompt: "Walk through the master control plane components (kube-apiserver, etcd, kube-scheduler, kube-controller-manager) and worker node components (kubelet, kube-proxy, container runtime).",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Control Plane: 1) kube-apiserver: Central gateway exposing REST API; validates and configures state; 2) etcd: Distributed consistent key-value store holding entire cluster state; 3) kube-scheduler: Assigns unscheduled pods to nodes based on resource requests, taints, and affinity; 4) kube-controller-manager: Runs controllers (DeploymentController, NodeController) reconciling current state to desired state.",
      "Worker Nodes: 1) kubelet: Primary node agent ensuring assigned pods are running and healthy; 2) kube-proxy: Manages network routing and iptables/IPVS rules for Services; 3) Container Runtime (containerd, CRI-O): Pulls images and runs containers."
    ],
    sample_answer: "A Kubernetes cluster consists of Control Plane nodes and Worker nodes. The Control Plane runs kube-apiserver (the central API hub), etcd (distributed key-value store of cluster state), kube-scheduler (assigns pods to worker nodes based on resources), and kube-controller-manager (reconciles desired state). Worker nodes run kubelet (agent communicating with the API server to manage containers), kube-proxy (configures networking and Service IP routing), and a container runtime like containerd.",
    follow_up_questions: [
      "What is the Raft consensus algorithm used by etcd to maintain quorum?",
      "What happens if all Control Plane nodes fail while worker nodes remain running?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "k8s-02",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Pods, Deployments and ReplicaSets",
    subtopic: "Pod vs Deployment vs ReplicaSet",
    question_title: "Compare Pod, ReplicaSet, and Deployment in Kubernetes.",
    question_prompt: "Why should you almost never create standalone Pods directly? Explain how a Deployment manages ReplicaSets to perform declarative rolling updates and rollbacks.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Pod: Smallest deployable unit in Kubernetes; encapsulates one or more containers sharing network namespace (localhost) and storage volumes.",
      "Why not standalone pods: If a pod dies or its node crashes, Kubernetes does NOT recreate standalone pods.",
      "ReplicaSet: Guarantees a specified number of identical pod replicas are running at all times using label selectors.",
      "Deployment: Higher-level abstraction that manages ReplicaSets. Enables declarative rolling updates (maxSurge, maxUnavailable), zero-downtime deployments, pauses, and rollbacks (kubectl rollout undo)."
    ],
    sample_answer: "A Pod is the smallest unit containing one or more co-located containers sharing localhost networking and volumes. However, standalone pods are mortal—if a pod crashes, it is never resurrected. A ReplicaSet maintains a desired count of running pods. A Deployment manages ReplicaSets declaratively, enabling zero-downtime rolling updates, canary releases, and automated rollbacks (kubectl rollout undo) by managing transitions between old and new ReplicaSets.",
    follow_up_questions: [
      "What are maxSurge and maxUnavailable settings in a Deployment rolling update strategy?",
      "What is a DaemonSet and a StatefulSet compared to a standard Deployment?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "k8s-03",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Services and Ingress",
    subtopic: "Kubernetes Service Types & Ingress",
    question_title: "Compare Kubernetes Service types: ClusterIP, NodePort, LoadBalancer, and Ingress.",
    question_prompt: "Explain how Kubernetes Services provide stable IP addresses and load balancing to ephemeral pods. Compare ClusterIP, NodePort, LoadBalancer, and Ingress Controllers.",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Why Services are needed: Pod IPs are ephemeral (change upon pod restart/rescheduling); Services provide a stable virtual IP and DNS name.",
      "ClusterIP (default): Internal-only virtual IP reachable only from within the cluster.",
      "NodePort: Exposes service on a static high-range port (30000-32767) across every worker node IP.",
      "LoadBalancer: Provisions a cloud provider external load balancer (AWS NLB/ALB, GCP LB) routing traffic to NodePort/ClusterIP. Costly if used for every service (1 LB per service).",
      "Ingress: Layer 7 application router (Nginx Ingress, Traefik). Uses a single external LoadBalancer IP to route traffic based on hostnames and paths (e.g. api.example.com -> serviceA, example.com/app -> serviceB) with SSL termination."
    ],
    sample_answer: "Because pod IPs are ephemeral, Services provide stable virtual IPs and DNS names mapped via label selectors. ClusterIP exposes pods internally within the cluster. NodePort opens a port (30000-32767) on all worker node IPs. LoadBalancer provisions an external cloud load balancer for that service. Ingress is a Layer 7 reverse proxy controller that manages external HTTP/HTTPS routing, SSL termination, and host/path routing through a single shared load balancer IP across multiple internal services.",
    follow_up_questions: [
      "What is the Kubernetes Gateway API and how is it succeeding Ingress?",
      "How does kube-proxy use iptables/IPVS to load balance traffic across pod endpoints?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "k8s-04",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Readiness and liveness probes",
    subtopic: "Liveness, Readiness, and Startup Probes",
    question_title: "Explain Liveness, Readiness, and Startup Probes in Kubernetes.",
    question_prompt: "What is the difference in behavior when a Liveness probe fails versus when a Readiness probe fails? How does a Startup probe protect slow-starting Java Spring Boot applications?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Readiness Probe: Determines if the pod is ready to accept user traffic. If it FAILS, Kubernetes removes the pod from the Service endpoint list (no traffic routed), but does NOT restart the pod.",
      "Liveness Probe: Determines if the container is healthy or in a broken deadlock. If it FAILS, kubelet restarts the container.",
      "Startup Probe: Disables liveness and readiness checks until the startup probe succeeds.",
      "Slow startup problem: Heavy Spring Boot apps can take 60-90s to boot. If liveness probe triggers after 20s, kubelet kills the container in a perpetual crash loop.",
      "Fix: Configure a startupProbe with failureThreshold: 30, periodSeconds: 10, giving the app 300s to boot before liveness checks take over."
    ],
    sample_answer: "Readiness probes check if a pod is ready to handle traffic: if failing, the pod is removed from Service endpoints so no traffic reaches it, but the container is not restarted. Liveness probes detect deadlocks: if failing, kubelet kills and restarts the container. For slow-starting Spring Boot apps, use a Startup probe: it suppresses liveness checks until initial boot succeeds, preventing kubelet from killing an application that is still executing startup migrations.",
    follow_up_questions: [
      "Why is having a Liveness probe check external dependencies (like an external database) an anti-pattern?",
      "What are the three probe mechanisms: HTTP GET, TCP Socket, and Exec command?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "k8s-05",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Scaling and resource requests/limits",
    subtopic: "Resource Requests vs Limits & QoS Classes",
    question_title: "How do CPU and Memory Requests and Limits work, and what are Kubernetes QoS Classes?",
    question_prompt: "Explain requests (guaranteed minimum) vs limits (enforced ceiling). What happens when a container exceeds CPU limits (throttling) vs Memory limits (OOMKilled)? What are Guaranteed, Burstable, and BestEffort QoS classes?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Requests: Minimum resources guaranteed. Kube-scheduler uses requests to place pods onto nodes with sufficient capacity.",
      "Limits: Maximum resources allowed.",
      "Exceeding CPU limit: CPU is compressible. Container is throttled (CPU cycles restricted via CFS cgroup quota), but NOT terminated.",
      "Exceeding Memory limit: Memory is non-compressible. Linux kernel terminates container immediately with exit code 137 (OOMKilled).",
      "Quality of Service (QoS) classes determine eviction priority when a node runs out of memory: 1) Guaranteed: requests == limits for all containers; 2) Burstable: requests < limits; 3) BestEffort: no requests or limits set (evicted first)."
    ],
    sample_answer: "Resource requests define the guaranteed capacity kube-scheduler uses to place pods on nodes. Limits set the ceiling. Because CPU is compressible, exceeding CPU limits causes CPU throttling (higher latency), but the pod stays alive. Memory is non-compressible: exceeding memory limits causes the Linux kernel to immediately kill the container with OOMKilled (exit 137). Kubernetes assigns QoS classes: Guaranteed (requests == limits) is last to be evicted during node resource pressure; BestEffort (no requests/limits) is evicted first.",
    follow_up_questions: [
      "What does '1000m' or '100m' mean in Kubernetes CPU units (millicores)?",
      "What is the difference between 'Mi' (Mebibytes) and 'M' (Megabytes) in Kubernetes memory definitions?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "k8s-06",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "ConfigMaps and Secrets",
    subtopic: "ConfigMaps and Secrets Management",
    question_title: "How do you manage configuration and credentials using ConfigMaps and Secrets?",
    question_prompt: "Explain creating and mounting ConfigMaps and Secrets: environment variables (envFrom / valueFrom) vs volume mounts. Why are standard Secrets not truly secure without KMS encryption at rest?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "ConfigMaps: Stores non-confidential configuration key-values or entire configuration files (application.yml).",
      "Secrets: Stores sensitive credentials (passwords, tokens, TLS certs).",
      "Injection methods: 1) Environment variables (envFrom or valueFrom.configMapKeyRef); 2) Mounted files (volumeMounts to /etc/config). Volume mounts update dynamically when ConfigMaps change without pod restart; environment variables require pod restart.",
      "Security limitation: Standard Kubernetes Secrets are only base64-encoded strings, NOT encrypted. Anyone with RBAC access to read secrets can decode them.",
      "Production security: Enable encryption at rest in etcd using KMS (AWS KMS / HashiCorp Vault), or use External Secrets Operator."
    ],
    sample_answer: "ConfigMaps store non-sensitive configuration, while Secrets store credentials. They can be injected as environment variables (which require pod restarts to refresh) or mounted as filesystem volumes (which update automatically when the ConfigMap is edited). A common misconception is that Kubernetes Secrets are encrypted: by default, they are merely base64-encoded in etcd. In production, enable KMS envelope encryption at rest in etcd or use Vault via External Secrets Operator.",
    follow_up_questions: [
      "How does the External Secrets Operator synchronize secrets from AWS Secrets Manager into Kubernetes?",
      "Why is mounting secrets as memory-backed tmpfs volumes safer than environment variables?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "k8s-07",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Scaling and resource requests/limits",
    subtopic: "Horizontal Pod Autoscaler (HPA)",
    question_title: "How does the Horizontal Pod Autoscaler (HPA) scale applications dynamically?",
    question_prompt: "Explain how HPA queries the Metrics Server to scale pod replicas based on target CPU utilization (targetCPUUtilizationPercentage: 70) or memory. How do custom metrics (Prometheus Adapter, KEDA) scale based on Kafka consumer lag?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "HPA operates as a control loop (every 15s) checking metrics from metrics.k8s.io (Metrics Server).",
      "Target replica formula: desiredReplicas = ceil[currentReplicas * (currentMetricValue / targetMetricValue)].",
      "Prerequisite: All pod containers MUST have resource 'requests' defined; without requests, HPA cannot calculate utilization percentage.",
      "KEDA (Kubernetes Event-driven Autoscaling): Allows scaling pods based on external events like Kafka consumer lag, RabbitMQ queue depth, or Redis queue length (including scale-to-zero).",
      "Stabilization window: Cooldown period (default 5 mins for scale down) prevents flapping (rapid thrashing between scaling up and down)."
    ],
    sample_answer: "The Horizontal Pod Autoscaler (HPA) periodically checks pod metrics from the Metrics Server. If average CPU utilization exceeds the target (e.g. 70% of requested CPU), HPA calculates desired replicas and scales the Deployment. Containers must have resource requests defined for percentage metrics to work. For event-driven workloads, KEDA (Kubernetes Event-driven Autoscaling) extends HPA to scale pods based on metrics like Kafka consumer lag, even supporting scale-to-zero when queues are empty.",
    follow_up_questions: [
      "What is the difference between HPA (horizontal scaling) and VPA (Vertical Pod Autoscaler)?",
      "What is cluster autoscaling (Cluster Autoscaler / Karpenter) when nodes run out of capacity?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "k8s-08",
    skill_slug: "kubernetes",
    skill_name: "Kubernetes",
    skill_category: "devops-tools",
    topic: "Pods, Deployments and ReplicaSets",
    subtopic: "Zero-Downtime Deployments & PreStop Hooks",
    question_title: "How do you achieve true Zero-Downtime Deployments in Kubernetes?",
    question_prompt: "When a deployment updates, why can clients experience 502/504 errors during pod termination? How does combining preStop sleep hooks with server.shutdown=graceful eliminate dropped connections?",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "Problem: When a pod is deleted, two things happen asynchronously in parallel: 1) Kubelet sends SIGTERM to the container; 2) EndpointSlice controller removes the pod IP from the Service and updates iptables / ingress proxies.",
      "Race condition: Updating ingress routing tables across the cluster takes a few seconds. If the application terminates immediately on SIGTERM, ingress continues sending new requests to a dead pod, causing 502 Bad Gateway errors.",
      "Solution 1 (preStop hook): lifecycle.preStop.exec.command: ['sleep', '15']. Gives ingress proxies 15 seconds to deregister the pod before the application process receives SIGTERM.",
      "Solution 2 (Graceful shutdown): Application handles SIGTERM by finishing in-flight requests before exiting.",
      "Solution 3 (terminationGracePeriodSeconds): Set to 30-60s to accommodate preStop sleep + graceful drain."
    ],
    sample_answer: "During a rolling update, Kubernetes removes the pod IP from load balancers while simultaneously sending SIGTERM to the container. Because propagating routing updates to ingress proxies takes a few seconds, an application that shuts down immediately on SIGTERM will reject in-flight requests with 502 Bad Gateway errors. The solution is adding a preStop hook (`sleep 15`) to keep the container accepting traffic until ingress deregistration finishes, combined with application-level graceful shutdown.",
    follow_up_questions: [
      "What is terminationGracePeriodSeconds and what happens when this timeout expires (SIGKILL)?",
      "How does maxUnavailable: 0 in the Deployment rollingUpdate strategy ensure capacity is never reduced during updates?"
    ],
    estimated_minutes: 15
  });

  // --- GIT AND GITHUB (7) ---
  addQ({
    id: "git-01",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Merge versus rebase",
    subtopic: "Git Merge vs Git Rebase",
    question_title: "Compare Git Merge and Git Rebase: Workflows, History, and Safety.",
    question_prompt: "When should you use git merge versus git rebase? Explain how rebase rewrites commit history (new commit SHAs) and why rebasing shared public branches is dangerous (The Golden Rule of Rebase).",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "git merge: Creates a non-destructive merge commit with two parents. Preserves exact chronological commit history. Downside: creates cluttered 'merge commit' noise in history graph.",
      "git rebase: Replays commits from your branch on top of the target branch, creating brand-new commit hashes. Result: A clean, linear commit history.",
      "Golden Rule of Rebase: Never rebase a public branch that others have pulled (like main). Rewriting shared commit history forces teammates into conflicting histories and messy reconciliations.",
      "Best practice workflow: Rebase local feature branch against main to resolve conflicts cleanly, then create Pull Request (Squash and Merge or Fast-Forward)."
    ],
    sample_answer: "Git merge combines branches with a merge commit, preserving exact chronological history without altering past commit hashes. Git rebase moves the base of a feature branch to the tip of another branch by replaying commits as brand-new commits, creating a clean linear history. The Golden Rule of Rebase states: never rebase public shared branches (like main) because rewriting shared commits breaks other developers' working copies. Use rebase locally on private branches to keep PR histories clean.",
    follow_up_questions: [
      "What is interactive rebase (git rebase -i) and how do squash and fixup work?",
      "Why does git push --force-with-lease safer than git push --force after a rebase?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "git-02",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Reset, revert and cherry-pick",
    subtopic: "Git Reset: Soft, Mixed, and Hard",
    question_title: "Compare git reset (--soft, --mixed, --hard) and git revert.",
    question_prompt: "Explain how git reset moves the HEAD pointer across the three trees (Working Directory, Staging Index, Commit History). When must you use git revert instead of git reset?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "git reset moves the current branch HEAD backward to an earlier commit.",
      "--soft: Moves HEAD. Leaves Staging Index and Working Directory untouched (all changes remain staged, ready to re-commit with a new message).",
      "--mixed (default): Moves HEAD and resets Staging Index. Working directory files are preserved as unstaged changes.",
      "--hard: Moves HEAD and overwrites BOTH Staging Index and Working Directory. All uncommitted work is permanently discarded.",
      "git revert: Creates a brand-new commit that applies the inverse diff of a target commit. Safe for public branches because it does NOT rewrite commit history."
    ],
    sample_answer: "git reset moves the HEAD pointer backward: --soft keeps changes staged in the index; --mixed (default) unstages changes into the working directory; --hard discards all changes in both index and working tree. Reset rewrites commit history and should only be used on local private branches. To undo changes already pushed to a shared remote branch, use git revert: it creates a new commit that applies the inverse diff, safely undoing the change without rewriting history.",
    follow_up_questions: [
      "How can you recover a commit lost after an accidental git reset --hard using git reflog?",
      "How do you revert a merge commit (git revert -m 1)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "git-03",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Reset, revert and cherry-pick",
    subtopic: "Git Cherry-Pick & Hotfixes",
    question_title: "How and when should you use git cherry-pick?",
    question_prompt: "Explain git cherry-pick <commit-hash>. Walk through a real production scenario, such as porting a critical bug fix from main back to a release maintenance branch.",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "git cherry-pick applies the diff of a specific commit from one branch onto the current checked-out branch, creating a new commit with a new SHA.",
      "Scenario: A critical security patch is fixed and committed to the main branch. The production release is running on release-v2.1. Instead of merging the entire main branch (which contains unreleased experimental features), you checkout release-v2.1 and cherry-pick the bug fix commit hash.",
      "Cherry-picking multiple commits: git cherry-pick A^..B.",
      "Conflict handling: Resolve conflicts manually, stage files, and run git cherry-pick --continue."
    ],
    sample_answer: "git cherry-pick applies the changes introduced by a specific commit onto your current branch, creating a new commit. A classic use case is backporting a production hotfix: if a critical bug is fixed on the main branch, but production is running on an older release branch (release-v1.4) that cannot accept all of main's unfinished features, you checkout release-v1.4 and run `git cherry-pick <fix-commit-hash>` to selectively port only that bug fix.",
    follow_up_questions: [
      "What are the dangers of overusing cherry-pick (duplicate commits across branches)?",
      "What does the -x flag do in git cherry-pick?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "git-04",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Conflict resolution",
    subtopic: "Merge Conflict Resolution",
    question_title: "How do merge conflicts occur, and how do you resolve them systematically?",
    question_prompt: "What triggers a merge conflict in Git (competing edits to the same lines in both branches)? Walk through conflict markers (<<<<<<< HEAD, =======, >>>>>>>), resolving conflicts, and completing the merge.",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "Trigger: Git automatically merges changes when edits occur in different files or different lines. Conflicts occur when the same line of code is modified differently in both branches, or one branch edits a file while the other deletes it.",
      "Markers: <<<<<<< HEAD (current branch version), ======= (separator), >>>>>>> branch-name (incoming version).",
      "Resolution process: 1) Open file and edit to desired final state, removing conflict markers; 2) git add <resolved-file>; 3) git commit (or git rebase --continue).",
      "Tools: Use GUI diff tools or IDE 3-way merge editors (showing local, remote, and common base)."
    ],
    sample_answer: "Merge conflicts happen when both branches have modified the exact same lines of code since their common ancestor. Git pauses the merge and inserts conflict markers: <<<<<<< HEAD shows your current branch changes, ======= separates the two versions, and >>>>>>> shows incoming changes. To resolve, edit the file to the correct combined code, delete all marker lines, stage the file with `git add`, and run `git commit` to complete the merge.",
    follow_up_questions: [
      "How do you abort an in-progress merge or rebase (git merge --abort / git rebase --abort)?",
      "What is git rerere (Reuse Recorded Resolution)?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "git-05",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Branching and merging",
    subtopic: "Git Branching Strategies: GitFlow vs Trunk-Based Development",
    question_title: "Compare GitFlow and Trunk-Based Development for modern engineering teams.",
    question_prompt: "Evaluate GitFlow (develop, feature, release, hotfix, main) vs Trunk-Based Development (short-lived feature branches, feature flags, continuous integration). Why does modern DevOps favor Trunk-Based?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "GitFlow: Strict branching model with long-lived branches (main, develop). Features branch off develop and take days/weeks to merge. Release branches harden before merge to main. Downsides: Merge hell, delayed integration feedback, inhibits continuous delivery.",
      "Trunk-Based Development: All developers merge small, frequent commits into a single shared branch (main/trunk) at least once per day.",
      "Feature flags: Unfinished features are merged into main behind dynamic feature toggles, keeping main always deployable to production.",
      "Why preferred: Prevents merge conflicts, enables true Continuous Integration (CI), and accelerates deployment frequency."
    ],
    sample_answer: "GitFlow relies on long-lived branches (develop, release, feature) that merge infrequently, resulting in painful merge conflicts and blocking continuous delivery. Trunk-Based Development has developers merge small, short-lived feature branches (< 1-2 days) directly into the main trunk. Incomplete features are hidden behind feature flags. Trunk-Based eliminates merge hell, supports continuous integration, and keeps the main branch constantly shippable to production.",
    follow_up_questions: [
      "How do Feature Flags decouple deployment from feature release?",
      "What branch protection rules should be enforced on the main branch in GitHub?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "git-06",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Pull requests and code review",
    subtopic: "GitHub Pull Request Workflows & Branch Protection",
    question_title: "What are GitHub Branch Protection Rules and Pull Request best practices?",
    question_prompt: "Explain essential GitHub branch protection settings: Require pull request reviews, Require status checks to pass (CI), Require signed commits, and Prevent force pushes. What makes an effective PR review?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Branch Protection Rules on main: 1) Require PR review approval before merging (minimum 1-2 reviewers); 2) Require status checks to pass (automated unit tests, lint, security scans must pass in CI); 3) Require branches to be up to date before merging; 4) Prevent force pushes (--force forbidden); 5) Prevent branch deletion.",
      "Merge strategies: Merge commit, Rebase and merge, Squash and merge (squashes entire PR into 1 clean commit on main).",
      "PR best practices: Small PR size (< 400 lines), clear description, automated test coverage, and prompt review turnarounds."
    ],
    sample_answer: "Branch protection rules enforce repository quality and compliance on the main branch: require at least one approving peer review, mandate passing CI status checks (unit tests and linting), prevent force pushes, and require linear history. Teams typically use 'Squash and Merge' to combine a multi-commit feature PR into a single descriptive commit on main, keeping repository history clean and easy to inspect.",
    follow_up_questions: [
      "What is CODEOWNERS in GitHub and how does it automate reviewer assignment?",
      "Why is 'Squash and merge' popular for feature pull requests?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "git-07",
    skill_slug: "git-github",
    skill_name: "Git and GitHub",
    skill_category: "devops-tools",
    topic: "Reset, revert and cherry-pick",
    subtopic: "Git Internals: Objects and Reflog",
    question_title: "How does Git store data internally (Blobs, Trees, Commits, and Annotated Tags)?",
    question_prompt: "Explain Git as a content-addressable key-value store (.git/objects). What is the difference between a Blob, a Tree, and a Commit? How does git reflog track every HEAD movement?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "medium",
    expected_answer_points: [
      "Content-addressable store: Git identifies every object by its 40-character SHA-1 (or SHA-256) hash.",
      "Blob: Stores raw file contents (does NOT store filename, permissions, or timestamps).",
      "Tree: Represents a directory; points to blobs (with filenames and permissions) and other sub-trees.",
      "Commit: Points to a root Tree object, parent commit(s), author, committer, and commit message.",
      "git reflog: Reference Log recording every change of HEAD (commits, checkouts, resets). Stored locally in .git/logs. Enables recovering 'lost' commits after an accidental hard reset."
    ],
    sample_answer: "Git is a content-addressable filesystem where objects are stored by their SHA hash. A Blob stores raw file data. A Tree stores directory structure, associating file names and permissions with Blobs and sub-Trees. A Commit references a root Tree, parent commit hashes, author info, and a message. Git reflog tracks every movement of HEAD on your local machine; even if you run `git reset --hard`, reflog retains the old commit hash, allowing you to restore supposedly lost work.",
    follow_up_questions: [
      "How do you recover a discarded commit using git reflog and git reset?",
      "What is the difference between a lightweight tag and an annotated tag in Git?"
    ],
    estimated_minutes: 12
  });

  // --- MAVEN (6) ---
  addQ({
    id: "mvn-01",
    skill_slug: "maven",
    skill_name: "Maven",
    skill_category: "devops-tools",
    topic: "Build lifecycle",
    subtopic: "Maven Default Lifecycle Phases",
    question_title: "Explain the standard Maven Build Lifecycle phases.",
    question_prompt: "Walk through the sequential phases of the default Maven lifecycle: validate, compile, test, package, verify, install, and deploy. What happens when you run 'mvn clean install'?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Maven has 3 built-in lifecycles: default (build/deploy), clean (delete target directory), and site (create documentation).",
      "Default lifecycle execution: Executing a phase runs all preceding phases in sequence.",
      "1. validate (checks project structure and pom.xml) -> 2. compile (compiles main source to target/classes) -> 3. test (executes unit tests with Surefire) -> 4. package (packages compiled code into JAR/WAR) -> 5. verify (runs integration tests with Failsafe) -> 6. install (copies JAR to local repository ~/.m2/repository) -> 7. deploy (uploads artifact to remote Nexus/Artifactory).",
      "mvn clean install: Cleans previous target artifacts, compiles, tests, packages, and installs the artifact into the local ~/.m2 cache."
    ],
    sample_answer: "Maven's default build lifecycle is an ordered sequence of phases: calling a later phase runs all preceding phases automatically. The sequence is: validate -> compile (compiles source code) -> test (runs unit tests) -> package (builds JAR/WAR) -> verify (runs integration tests) -> install (installs JAR to local ~/.m2/repository) -> deploy (publishes to remote Artifactory/Nexus). 'mvn clean install' deletes the target folder, compiles and tests the project, and installs the built JAR locally.",
    follow_up_questions: [
      "How do you skip running unit tests during build (e.g. -DskipTests vs -Dmaven.test.skip=true)?",
      "What is the difference between the Maven Surefire Plugin and Maven Failsafe Plugin?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "mvn-02",
    skill_slug: "maven",
    skill_name: "Maven",
    skill_category: "devops-tools",
    topic: "Dependency scopes and transitive dependencies",
    subtopic: "Maven Dependency Scopes",
    question_title: "Explain Maven Dependency Scopes: compile, provided, runtime, test, and system.",
    question_prompt: "Compare dependency scopes in pom.xml. Which scopes are transitive, which are packaged into the final JAR/WAR, and why is Lombok typically marked as provided?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "compile (default): Available on all classpaths (compile, test, runtime). Packaged into final artifact. Transitive.",
      "provided: Needed for compilation and testing, but expected to be provided by the runtime environment (e.g. servlet-api in Tomcat, or Lombok which processes annotations at compile time and is discarded). NOT packaged in final JAR.",
      "runtime: Not needed for compilation, but required during execution (e.g. JDBC driver implementations like postgresql or mysql-connector-j).",
      "test: Available only for compiling and running test suites (JUnit, Mockito). NOT packaged into production artifact; not transitive.",
      "import: Used in <dependencyManagement> with type pom to import a BOM (e.g. spring-boot-dependencies)."
    ],
    sample_answer: "Maven dependency scopes control classpath availability and packaging: 'compile' (default) is available everywhere and included in the final package. 'provided' is needed for compilation but excluded from the final package because the runtime container provides it (or it's a compile-time processor like Lombok). 'runtime' is excluded from compilation but bundled for execution (like JDBC drivers). 'test' is restricted to testing (JUnit/Mockito) and excluded from the production JAR.",
    follow_up_questions: [
      "Why is Lombok marked as <scope>provided</scope>?",
      "Why are JDBC driver dependencies configured with <scope>runtime</scope>?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "mvn-03",
    skill_slug: "maven",
    skill_name: "Maven",
    skill_category: "devops-tools",
    topic: "Dependency scopes and transitive dependencies",
    subtopic: "Transitive Dependencies & Conflict Resolution",
    question_title: "How does Maven resolve Transitive Dependency Conflicts, and how do you exclude dependencies?",
    question_prompt: "Explain Maven's dependency mediation rule: 'Nearest Definition Wins' in the dependency tree. How do you inspect conflicts with mvn dependency:tree and use <exclusions> to resolve duplicate library versions?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Transitive dependency: If Project A depends on B, and B depends on C, Project A automatically inherits C.",
      "Nearest Definition Rule: If multiple versions of a dependency exist in the tree, Maven picks the one closest to the root project. E.g. A -> B -> C (v1.0) vs A -> D -> E -> C (v2.0). Maven selects v1.0 because its depth is 2 hops versus 3 hops.",
      "Tie-breaker: If depth is identical, first declaration in pom.xml wins.",
      "Debugging: 'mvn dependency:tree -Dverbose' identifies conflicting versions.",
      "Resolution: Add explicit <exclusions> block inside the dependency or declare the desired version directly in <dependencyManagement> to override all transitive versions."
    ],
    sample_answer: "Maven resolves conflicting transitive versions using the 'Nearest Definition Wins' rule: the version closest to the root project in the dependency tree is chosen regardless of which version number is higher. If two versions are at identical depth, the first declared in pom.xml wins. To inspect conflicts, run `mvn dependency:tree`. Resolve conflicts by adding an <exclusions> block to omit unwanted transitive libraries, or declare the explicit version in <dependencyManagement>.",
    follow_up_questions: [
      "What is a Bill of Materials (BOM) and how does Spring Boot use it in <dependencyManagement>?",
      "What causes a NoSuchMethodError or ClassNotFoundException due to transitive dependency conflicts at runtime?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mvn-04",
    skill_slug: "maven",
    skill_name: "Maven",
    skill_category: "devops-tools",
    topic: "Profiles and multi-module builds",
    subtopic: "Multi-Module Maven Projects",
    question_title: "How do you structure and build a Multi-Module Maven Project?",
    question_prompt: "Explain root parent pom.xml (<packaging>pom</packaging>, <modules>, <dependencyManagement>). How do child submodules inherit configurations and declare inter-module dependencies?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Root Parent POM: Declares <packaging>pom</packaging> and lists <modules> (<module>core</module>, <module>api</module>, <module>web</module>).",
      "<dependencyManagement>: Centralizes dependency versions in the parent POM without forcing submodules to download them unless declared.",
      "Submodule POM: Declares <parent> pointing to the root POM, inheriting groupId, version, plugins, and dependencies.",
      "Inter-module dependencies: Submodule 'web' declares dependency on submodule 'core' using ${project.version}.",
      "Reactor build: Maven analyzes dependencies between modules and automatically builds them in correct topological order."
    ],
    sample_answer: "A multi-module Maven project uses a parent pom.xml with packaging 'pom' listing submodules under <modules>. The parent defines versions and plugins centrally inside <dependencyManagement> and <pluginManagement>. Submodules specify the parent and declare only the dependencies they require without specifying version numbers. When building from the root, Maven's Reactor analyzes inter-module dependencies and compiles modules in the correct topological order.",
    follow_up_questions: [
      "What is the difference between <dependencies> and <dependencyManagement> in a parent POM?",
      "How do you build only one specific submodule and its dependencies (mvn -pl submodule -am)?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "mvn-05",
    skill_slug: "maven",
    skill_name: "Maven",
    skill_category: "devops-tools",
    topic: "Plugins and goals",
    subtopic: "Maven Plugins and Goals",
    question_title: "Explain the relationship between Maven Plugins, Goals, and Lifecycle Phases.",
    question_prompt: "What is a Maven Plugin? How do Plugin Goals bind to Lifecycle Phases (e.g. spring-boot-maven-plugin:repackage binding to the package phase)?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "A Maven Plugin is an artifact providing a set of Goals (e.g. maven-compiler-plugin has 'compile' and 'testCompile' goals).",
      "Goal: A specific fine-grained task that can be executed directly (mvn compiler:compile) or bound to a lifecycle phase.",
      "Binding: When a lifecycle phase executes, Maven executes all plugin goals bound to that phase.",
      "Default bindings: 'compile' phase binds compiler:compile; 'test' phase binds surefire:test; 'package' phase binds jar:jar.",
      "spring-boot-maven-plugin: 'repackage' goal binds to 'package' phase to take the standard compiled JAR and bundle all dependencies into an executable fat JAR with embedded Tomcat."
    ],
    sample_answer: "Maven's core engine is essentially a phase coordinator; all actual work is performed by Plugins. A plugin contains one or more Goals (e.g. compiler:compile). Plugin goals are bound to lifecycle phases: when the 'package' phase runs, Maven executes default goals like jar:jar. The spring-boot-maven-plugin binds its 'repackage' goal to the 'package' phase, transforming standard JARs into executable fat JARs containing nested dependencies and a launcher.",
    follow_up_questions: [
      "What is the difference between executing 'mvn test' vs 'mvn surefire:test'?",
      "How do you bind a custom plugin execution to the 'generate-sources' phase?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "mvn-06",
    skill_slug: "maven",
    skill_name: "Maven",
    skill_category: "devops-tools",
    topic: "Profiles and multi-module builds",
    subtopic: "Maven Profiles & Environment Properties",
    question_title: "How do Maven Profiles enable environment-specific builds?",
    question_prompt: "Explain <profiles> in pom.xml. How do you activate profiles via command line (-Pdev), file existence, or OS environment, and how do resource filters replace property placeholders?",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "<profiles>: Defines environment-specific configuration sets (properties, dependencies, plugins) inside pom.xml.",
      "Activation methods: 1) Explicit CLI flag: mvn clean package -Pprod; 2) Automatic via <activation> (checking JDK version, OS name, or file existence); 3) <activeByDefault>true</activeByDefault>.",
      "Resource filtering: With <filtering>true</filtering> enabled on <resources>, Maven scans application.properties and replaces ${db.url} placeholders with the active profile's property values during process-resources phase.",
      "Modern note: In Spring Boot, Spring Profiles (application-prod.yml) are preferred over Maven build-time filtering to keep container images immutable."
    ],
    sample_answer: "Maven Profiles allow customizing build configurations for different targets (dev, test, prod). Activated via `mvn package -Pprod` or conditional rules, profiles can override properties, dependencies, and plugins. Using Maven resource filtering, build-time properties can be injected into configuration files. However, modern container best practices favor keeping JAR artifacts immutable and using runtime Spring Profiles instead of Maven build-time filtering.",
    follow_up_questions: [
      "Why is runtime environment configuration preferred over Maven build-time profile filtering in Docker containers?",
      "What is the settings.xml file and how do user profiles differ from project pom.xml profiles?"
    ],
    estimated_minutes: 10
  });

  // --- CI/CD AND DEPLOYMENT (7) ---
  addQ({
    id: "cicd-01",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Build/test/deploy pipeline",
    subtopic: "CI/CD Core Concepts & Pipeline Stages",
    question_title: "What are the core stages of a modern CI/CD Pipeline?",
    question_prompt: "Define Continuous Integration (CI), Continuous Delivery (CD), and Continuous Deployment. Detail pipeline stages: Lint/Static Analysis, Unit Test, Build, Integration Test, Security Scan, and Automated Deployment.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Continuous Integration (CI): Automates code integration into shared repository daily; runs automated builds and unit tests on every commit.",
      "Continuous Delivery (CD): Ensures code is ALWAYS in a releasable state; automated deployment to staging, with manual approval gate to push to production.",
      "Continuous Deployment: Every change that passes automated test stages is deployed to production automatically without human intervention.",
      "Standard stages: 1) Checkout -> 2) Lint & Static Code Analysis (SonarQube) -> 3) Unit Testing -> 4) Compile/Build Artifact (Docker image) -> 5) Integration & Contract Tests -> 6) Security Scanning (Trivy/Snyk) -> 7) Deploy to Staging -> 8) Deploy to Production."
    ],
    sample_answer: "Continuous Integration (CI) automatically builds and tests code on every commit to detect defects early. Continuous Delivery automates artifact creation and deployments to staging, keeping software ready for production release upon manual sign-off. Continuous Deployment goes one step further by automatically pushing passed builds straight to production. A robust pipeline runs linting, unit tests, artifact building, security scans, and deployment stages sequentially.",
    follow_up_questions: [
      "What is the difference between Fast-Feedback unit test stages and slow end-to-end integration stages?",
      "How do GitHub Actions workflows define jobs, steps, and runners?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "cicd-02",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Rollback and release strategies",
    subtopic: "Blue-Green vs Canary Deployments",
    question_title: "Compare Blue-Green Deployments and Canary Releases.",
    question_prompt: "Explain how Blue-Green and Canary release strategies achieve zero downtime and reduce deployment risk. How do load balancers and feature flags route traffic during transitions?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "critical",
    expected_answer_points: [
      "Blue-Green Deployment: Two identical production environments. Blue runs current live traffic. Deploy new version to Green, run health checks. Once verified, switch load balancer router from Blue to Green instantly. Rollback is instant by switching router back to Blue if errors occur. Downside: Doubles infrastructure costs.",
      "Canary Release: Roll out new version to a small percentage of users (e.g. 2% -> 10% -> 50% -> 100%) while majority remain on stable version. Monitor error rates, latency, and logs. If anomalies occur, revert routing immediately, impacting only 2% of users. Cost-effective, minimizes blast radius."
    ],
    sample_answer: "Blue-Green deployments maintain two identical environments: live traffic points to Blue while Green is upgraded and tested; once validated, the router switches all traffic to Green instantly, allowing immediate rollback by reverting the router. Canary deployments gradually route a small fraction of real traffic (e.g. 5%) to the new version while monitoring metrics (error rate, latency). If healthy, traffic increases to 100%; if errors spike, the canary is rolled back, minimizing blast radius.",
    follow_up_questions: [
      "How do database schema migrations complicate Blue-Green deployments (backward compatibility requirement)?",
      "What is Argo Rollouts or Flagger for automated Kubernetes canary deployments?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cicd-03",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Rollback and release strategies",
    subtopic: "Database Migrations in Zero-Downtime Deployments",
    question_title: "How do you manage Database Schema Migrations during Zero-Downtime Deployments?",
    question_prompt: "Explain why destructive database changes (renaming columns, dropping columns) break zero-downtime rolling updates. Walk through the Expand-and-Contract (Parallel Run) pattern for schema evolution.",
    question_type: "practical_scenario",
    difficulty: "advanced",
    priority: "critical",
    expected_answer_points: [
      "The problem: During a rolling update, Version 1 and Version 2 of the application run simultaneously and query the same database. If V2 immediately drops or renames a column, V1 crashes.",
      "Expand-and-Contract Pattern (Three-Phase Migration):",
      "Phase 1 (Expand): Add new column (nullable or with default) without deleting old column. V1 still uses old column.",
      "Phase 2 (Migrate & Dual-Write): Deploy V2, which writes to both old and new columns and reads from new column. Run backfill script to populate historical data from old to new column.",
      "Phase 3 (Contract): After V1 is completely decommissioned and all pods run V2, drop the old column in a subsequent migration."
    ],
    sample_answer: "Destructive migrations (dropping or renaming columns) break rolling deployments because old and new application instances query the database simultaneously. To achieve zero-downtime schema evolution, use the Expand-and-Contract pattern: 1) Expand: add the new column while keeping the old column active. 2) Deploy the new app version, which dual-writes to both columns and reads from the new one. 3) Contract: after old app versions are fully retired, run a final migration to drop the old column.",
    follow_up_questions: [
      "How do tools like Flyway and Liquibase manage migration versioning in Spring Boot?",
      "Why should all new database columns added during migrations be nullable or have default values?"
    ],
    estimated_minutes: 15
  });

  addQ({
    id: "cicd-04",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Build/test/deploy pipeline",
    subtopic: "GitHub Actions Workflow Syntax",
    question_title: "How do you construct a production CI/CD workflow in GitHub Actions?",
    question_prompt: "Explain .github/workflows/ci.yml structure: triggers (on: push, pull_request), jobs, strategy matrix, actions/checkout, actions/setup-java, caching dependencies, and secrets.",
    question_type: "coding",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Triggers: on: push: branches: [main], pull_request: branches: [main].",
      "Jobs: jobs: build: runs-on: ubuntu-latest.",
      "Steps: - uses: actions/checkout@v4 (clones repo).",
      "Java setup: - uses: actions/setup-java@v4 with java-version: '17', distribution: 'temurin', cache: 'maven' (automatically caches ~/.m2 dependencies across runs).",
      "Run commands: - name: Run tests \n run: mvn clean verify.",
      "Secrets: Environment variables mapped securely from ${{ secrets.DOCKERHUB_TOKEN }}."
    ],
    sample_answer: "GitHub Actions workflows are YAML files in .github/workflows/. Define triggers (push, pull_request), specify virtual runner environments (runs-on: ubuntu-latest), and define sequential steps. Use official actions like actions/checkout@v4 and actions/setup-java@v4 with built-in Maven caching (cache: 'maven') to avoid re-downloading dependencies on every run. Secrets are referenced securely via `${{ secrets.MY_SECRET }}` without exposing credentials in repository logs.",
    follow_up_questions: [
      "How does a build matrix (strategy.matrix) run tests across multiple Node or Java versions in parallel?",
      "What is the difference between GITHUB_TOKEN and custom repository secrets?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cicd-05",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Artifact and image promotion",
    subtopic: "GitOps with ArgoCD / Flux",
    question_title: "What is GitOps, and how does declarative deployment with ArgoCD work?",
    question_prompt: "Explain the core principles of GitOps: Git as the single source of truth, declarative Kubernetes manifests, and pull-based synchronization. Why is pull-based GitOps more secure than push-based CI/CD?",
    question_type: "conceptual",
    difficulty: "advanced",
    priority: "high",
    expected_answer_points: [
      "Core principle: Git repository holds the entire declarative desired state of the infrastructure and applications (Kustomize/Helm manifests).",
      "Pull-based deployment: An in-cluster agent (ArgoCD or Flux) periodically polls the Git repository, detects drift between Git and live cluster, and reconciles the cluster to match Git.",
      "Push vs Pull security: In push-based CI (Jenkins/GitHub Actions), the CI runner must store high-privilege cluster admin credentials to execute `kubectl apply`. In pull-based GitOps, no cluster credentials leave the cluster; the agent pulls from Git internally.",
      "Self-healing & Auditing: Any manual changes made to the cluster (kubectl edit) are automatically overwritten by ArgoCD to restore Git state. Git commit logs provide a complete audit trail."
    ],
    sample_answer: "GitOps establishes Git as the single source of truth for infrastructure and deployment state. In-cluster operators like ArgoCD continuously compare the live cluster state with Kubernetes manifests stored in Git. If drift is detected, ArgoCD automatically reconciles the cluster to match Git. Unlike push-based CI systems that require external access to cluster credentials, GitOps operators pull manifests from inside the cluster, significantly improving security and providing an auditable commit history.",
    follow_up_questions: [
      "How does Kustomize enable environment-specific overlays (dev/stage/prod) without templating?",
      "What is Out-of-Sync state and automated self-healing in ArgoCD?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cicd-06",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Environment and secret management",
    subtopic: "Secret Management in CI/CD Pipelines",
    question_title: "How do you manage secrets securely in CI/CD without checking credentials into Git?",
    question_prompt: "What tools and practices prevent secrets from leaking into Git repositories? Compare Sealed Secrets, SOPS (Mozilla), HashiCorp Vault, and cloud secret managers.",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Golden rule: Never commit plaintext secrets, private keys, or API tokens to source control.",
      "Pre-commit hooks: Tools like git-secrets, gitleaks, or detect-secrets block commits containing API keys or passwords before they leave developer machines.",
      "Sealed Secrets: Encrypts secrets using cluster public key; safe to commit encrypted SealedSecret manifests to Git. Only the in-cluster controller holds the private key to decrypt into native Secrets.",
      "Mozilla SOPS: Encrypts specific YAML values using AWS KMS, GCP KMS, or PGP, allowing encrypted config files to be version-controlled in Git.",
      "HashiCorp Vault: Dynamic short-lived credentials generated on the fly via OpenID Connect (OIDC) identity federation."
    ],
    sample_answer: "Secrets must never be committed in plaintext to Git. Mitigate leaks on developer machines using pre-commit hooks (like Gitleaks). For GitOps workflows, tools like Mozilla SOPS or Bitnami Sealed Secrets allow encrypting secret values with asymmetric keys so that encrypted manifests can be version-controlled in Git safely. Advanced architectures use HashiCorp Vault or cloud providers with OIDC federated authentication, issuing short-lived, dynamic credentials directly to CI jobs without static secrets.",
    follow_up_questions: [
      "How does GitHub Actions OIDC integration eliminate hardcoded AWS access keys using AssumeRoleWithWebIdentity?",
      "What immediate steps must you take if an AWS production secret key is accidentally committed to a public Git repository?"
    ],
    estimated_minutes: 12
  });

  addQ({
    id: "cicd-07",
    skill_slug: "cicd",
    skill_name: "CI/CD and Deployment",
    skill_category: "devops-tools",
    topic: "Artifact and image promotion",
    subtopic: "Immutable Artifacts & Image Tagging",
    question_title: "Why is 'latest' an anti-pattern in Docker image tagging, and how do you implement Immutable Artifacts?",
    question_prompt: "Why should :latest tags never be deployed to production? How does tagging images with Git commit SHA (e.g. app:sha-a1b2c3d) guarantee traceability and reliable rollbacks?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "The 'latest' trap: ':latest' is mutable; it is merely a default pointer pointing to the most recent untagged build. Two pods starting 5 minutes apart can pull completely different images under ':latest'.",
      "Rollback failure: Kubernetes Deployment cannot trigger a rollout update if the image tag string remains 'app:latest' because the manifest doesn't change.",
      "Immutable Artifact principle: Build an artifact once and promote the exact same binary through Dev, QA, Staging, and Production without rebuilding.",
      "Tagging strategy: Tag with Git commit SHA (e.g. myapp:a1b2c3d) or SemVer release tag (myapp:v1.2.3).",
      "Traceability: Guaranteed 1:1 mapping between running production container and exact Git commit source code."
    ],
    sample_answer: "Using ':latest' in production is dangerous because it is mutable—two pods deployed hours apart may run different underlying images, and Kubernetes cannot detect changes if the image tag string doesn't change. The Immutable Artifact pattern mandates building an image once and promoting that exact binary across environments. Tagging images with the Git commit SHA (app:sha-8f3a12b) guarantees deterministic rollbacks and provides exact traceability from production errors back to the source commit.",
    follow_up_questions: [
      "What is imageDigest (sha256:...) and why is it the most tamper-proof image reference?",
      "Why must container images never be rebuilt between staging and production environments?"
    ],
    estimated_minutes: 10
  });

  // --- AGILE / SCRUM (6) ---
  addQ({
    id: "agile-01",
    skill_slug: "agile-scrum",
    skill_name: "Agile / Scrum",
    skill_category: "devops-tools",
    topic: "Sprint planning and refinement",
    subtopic: "Scrum Ceremonies & Artifacts",
    question_title: "Explain the four core Scrum Ceremonies and their distinct purposes.",
    question_prompt: "Walk through Sprint Planning, Daily Standup, Sprint Review, and Sprint Retrospective. What are the key artifacts: Product Backlog, Sprint Backlog, and Increment?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "high",
    expected_answer_points: [
      "1. Sprint Planning: Team aligns with Product Owner on Sprint Goal and selects items from Product Backlog into Sprint Backlog.",
      "2. Daily Standup (15 mins): Inspect progress toward Sprint Goal; team members answer what they did, what they plan to do, and identify blockers.",
      "3. Sprint Review: Demo working software increment to stakeholders for feedback and backlog adjustment.",
      "4. Sprint Retrospective: Team inspects internal processes, collaboration, and tools, identifying concrete improvements for the next sprint.",
      "Artifacts: Product Backlog (prioritized roadmap), Sprint Backlog (committed sprint tasks), and Increment (releasable software matching Definition of Done)."
    ],
    sample_answer: "Scrum structures work into Sprints governed by 4 ceremonies: Sprint Planning defines the Sprint Goal and selects tasks from the Product Backlog into the Sprint Backlog. The Daily Standup is a 15-minute synchronization on progress and blockers. The Sprint Review demos the completed working Increment to stakeholders. The Sprint Retrospective focuses on continuous team improvement—analyzing what went well and what processes to refine in the next sprint.",
    follow_up_questions: [
      "What is the difference between a Sprint Review and a Sprint Retrospective?",
      "What is Backlog Refinement (Grooming) and why is it continuous?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "agile-02",
    skill_slug: "agile-scrum",
    skill_name: "Agile / Scrum",
    skill_category: "devops-tools",
    topic: "Definition of done and handling blockers",
    subtopic: "Definition of Done (DoD) vs Acceptance Criteria",
    question_title: "What is the difference between Definition of Done (DoD) and Acceptance Criteria?",
    question_prompt: "Explain how Acceptance Criteria applies to a specific User Story, while Definition of Done applies globally across all stories in the engineering organization. Provide real examples.",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "critical",
    expected_answer_points: [
      "Acceptance Criteria (AC): Specific to a single user story. Defined by Product Owner. Functional business requirements (e.g. 'User receives a verification email within 30 seconds', 'Password must require at least 8 characters').",
      "Definition of Done (DoD): Universal engineering quality checklist that EVERY story must satisfy before being considered complete. Defined by engineering team.",
      "DoD example checklist: Code reviewed and approved by peer; unit test coverage >= 80%; integration tests passing; documentation updated; zero high/critical security scan alerts; deployed to staging.",
      "Protects against technical debt: Prevents declaring a feature 'done' when it is un-tested or un-documented."
    ],
    sample_answer: "Acceptance Criteria are unique functional requirements defined by the Product Owner for a specific story (e.g. 'User can filter by date range'). The Definition of Done (DoD) is a universal quality agreement defined by engineering that every story must meet to be considered releasable: code reviewed, unit tests passing, static analysis clean, documentation updated, and verified in staging. DoD protects against technical debt and prevents half-baked code from reaching production.",
    follow_up_questions: [
      "What is the Definition of Ready (DoR) for a user story entering sprint planning?",
      "What should happen if a story meets acceptance criteria but fails the Definition of Done at sprint end?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "agile-03",
    skill_slug: "agile-scrum",
    skill_name: "Agile / Scrum",
    skill_category: "devops-tools",
    topic: "Estimation and story points",
    subtopic: "Story Points & Planning Poker",
    question_title: "How does Story Point estimation work, and why are points preferred over hours?",
    question_prompt: "Explain relative estimation using modified Fibonacci sequence (1, 2, 3, 5, 8, 13). Why do story points evaluate complexity, uncertainty, and effort rather than linear hours?",
    question_type: "conceptual",
    difficulty: "intermediate",
    priority: "medium",
    expected_answer_points: [
      "Story points measure relative effort, complexity, and unknown risks, not calendar hours.",
      "Why hours fail: A senior engineer may take 2 hours while a junior takes 8 hours for the same task. Estimating in hours creates endless debate. Story points normalize complexity across the entire team.",
      "Modified Fibonacci scale (1, 2, 3, 5, 8, 13): Reflects increased uncertainty as task size grows (hard to differentiate 11 vs 12, but easy to see difference between 5 and 8).",
      "Planning Poker: Team members reveal point estimates simultaneously to prevent anchoring bias; team discusses outliers (highest and lowest) to reach consensus.",
      "Spikes: Stories larger than 13 are typically broken down or preceded by a time-boxed research Spike."
    ],
    sample_answer: "Story points quantify relative effort, technical complexity, and uncertainty using a modified Fibonacci scale (1, 2, 3, 5, 8, 13). Estimating in hours is flawed because developers work at different speeds, while complexity remains constant. Planning Poker avoids anchoring bias by having developers reveal estimates simultaneously; large discrepancies prompt discussion on hidden complexities. Tasks estimated at 13+ points are split into smaller deliverables.",
    follow_up_questions: [
      "What is a Technical Spike and when should it be scheduled?",
      "What is Velocity and how is it used to forecast team capacity?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "agile-04",
    skill_slug: "agile-scrum",
    skill_name: "Agile / Scrum",
    skill_category: "devops-tools",
    topic: "Daily standups and retrospectives",
    subtopic: "Effective Retrospectives & Continuous Improvement",
    question_title: "How do you run an effective Sprint Retrospective that drives actionable change?",
    question_prompt: "Explain the purpose of the Sprint Retrospective. How do formats like 'Mad/Sad/Glad' or 'Start/Stop/Continue' uncover systemic problems, and how do you track action items?",
    question_type: "practical_scenario",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Prime Directive of Retrospectives: Regardless of what is discovered, we understand and truly believe that everyone did the best job they could given what they knew at the time.",
      "Psychological safety: Blameless environment focused on systems and processes, not individuals.",
      "Frameworks: 'What went well', 'What didn't go well', 'Ideas / Actions' or 'Start, Stop, Continue'.",
      "Actionable outputs: Team votes on 1-2 high-priority improvements assigned to specific owners and tracked in the next sprint backlog.",
      "Failure mode: Complaining without creating concrete, measurable action items."
    ],
    sample_answer: "A Sprint Retrospective provides a blameless forum to inspect team processes, tooling, and communication. Grounded in the Agile Prime Directive (assuming good intentions), the team uses frameworks like 'Start, Stop, Continue' or 'What went well / What can be improved' to identify friction. Crucially, every retrospective must conclude with 1-2 concrete, measurable action items assigned to specific owners and reviewed at the beginning of the next retrospective.",
    follow_up_questions: [
      "What is psychological safety and why is it essential for retrospectives?",
      "How do you handle a retrospective where team members are hesitant to speak up?"
    ],
    estimated_minutes: 8
  });

  addQ({
    id: "agile-05",
    skill_slug: "agile-scrum",
    skill_name: "Agile / Scrum",
    skill_category: "devops-tools",
    topic: "Definition of done and handling blockers",
    subtopic: "Handling Scope Creep & Mid-Sprint Changes",
    question_title: "How do you handle unplanned work and Scope Creep mid-sprint?",
    question_prompt: "What should a Scrum team do when a stakeholder requests an 'urgent' new feature in the middle of an active sprint? How do you protect the Sprint Goal while remaining responsive?",
    question_type: "practical_scenario",
    difficulty: "intermediate",
    priority: "high",
    expected_answer_points: [
      "Sprint Goal sanctity: The sprint backlog is committed to achieve the agreed Sprint Goal. Adding scope mid-sprint threatens team focus and delivery.",
      "Evaluation: Product Owner evaluates business urgency with the team.",
      "Trade-off rule (One-in, One-out): If an urgent feature MUST be added, an equivalent story-point amount of non-critical work must be removed from the sprint backlog back to the product backlog.",
      "True critical production outages: Handled immediately via expedited hotfixes, with team capacity budgeted upfront for unplanned production support.",
      "Abnormal termination: If a priority shift fundamentally invalidates the entire Sprint Goal, the Product Owner cancels the sprint and calls a new planning session."
    ],
    sample_answer: "Mid-sprint scope changes threaten the agreed Sprint Goal. The Product Owner evaluates the request: if it can wait, it is placed in the Product Backlog for the next sprint. If truly critical, the team applies the 'trade-off rule'—adding new points requires removing an equivalent amount of unfinished work back to the backlog to preserve capacity. If a business shift completely invalidates the Sprint Goal, the Product Owner can cancel the sprint.",
    follow_up_questions: [
      "How do teams budget for production bugs and maintenance without disrupting sprint velocity?",
      "What is the difference between a Scrum Master and a Product Owner when scope disputes arise?"
    ],
    estimated_minutes: 10
  });

  addQ({
    id: "agile-06",
    skill_slug: "agile-scrum",
    skill_name: "Agile / Scrum",
    skill_category: "devops-tools",
    topic: "Estimation and story points",
    subtopic: "Burndown Charts & Velocity Metrics",
    question_title: "How do you read a Sprint Burndown Chart and calculate Velocity?",
    question_prompt: "Explain the Sprint Burndown Chart (remaining story points over sprint days). What does it mean when the actual line stays flat, drops precipitously on the final day, or finishes above the ideal line?",
    question_type: "conceptual",
    difficulty: "beginner",
    priority: "medium",
    expected_answer_points: [
      "Burndown chart: X-axis is sprint days; Y-axis is remaining story points. Ideal line descends steadily to zero on day 10.",
      "Flat line dropping on last day ('Cliff' pattern): Stories are too large or QA testing is delayed until the end (mini-waterfall). Stories only burn points when 100% complete (satisfying DoD).",
      "Actual line staying above ideal: Team overcommitted or encountered unexpected technical blockers/dependencies.",
      "Actual line below ideal: Team undercommitted or finished work faster than expected.",
      "Velocity: Average number of story points completed (meeting DoD) across past 3-5 sprints. Used to predict future sprint capacity."
    ],
    sample_answer: "A Burndown chart plots remaining story points across sprint days against an ideal descent line. If the line remains flat and drops precipitously on the final day, it signals a mini-waterfall where stories are too large or QA validation is postponed to the sprint end. Finishing above the ideal line indicates overcommitment or blockers. Velocity is the rolling average of completed story points across past sprints, providing data-driven capacity planning for future sprints.",
    follow_up_questions: [
      "Why should partially completed stories receive zero story points at sprint end?",
      "What is the difference between a Sprint Burndown and a Release Burnup Chart?"
    ],
    estimated_minutes: 10
  });
};
