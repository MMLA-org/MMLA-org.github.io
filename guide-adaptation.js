window.MMLA_GUIDE_PARTS = window.MMLA_GUIDE_PARTS || [];
window.MMLA_GUIDE_PARTS.push(
  {
    id: "rtt",
    title: { zh: "推理时训练：同题反馈如何改变下一步推理", en: "Reasoning-Time Training: How Feedback Changes the Next Reasoning Step" },
    subtitle: { zh: "RTT Foundations · MMLA v4 Part I, §§19–32", en: "RTT Foundations · MMLA v4 Part I, §§19–32" },
    lead: {
      zh: "RTT 把同一道尚未解决的问题中，反馈驱动的策略状态更新与后续实际使用定义为一个可核查的过程。任务表现由独立的因果设计评估。",
      en: "RTT defines a checkable process in which feedback updates policy state while the same problem remains unresolved, and a later attempt actually uses that state. Task outcomes are evaluated with a separate causal design."
    },
    source: { file: "assets/papers/RTT_Foundations.pdf", label: "Reasoning-Time Training", page: 1 },
    sections: [
      {
        id: "rtt-witness",
        title: { zh: "严格见证：八个条件连成一条轨迹", en: "Strict witness: eight conditions form one trace" },
        purpose: { zh: "判定一次更新是否真是同题推理时训练。", en: "Determine whether an update is truly within-problem reasoning-time training." },
        input: { zh: "输入是带不可变题目标识、尝试、反馈、更新时间、策略版本和重置纪元的事件记录。", en: "The input is an event record containing an immutable problem identity, attempts, feedback, update time, policy versions, and reset epoch." },
        process: { zh: "W1 要求前后两次尝试属于同一不可变题目；W2 分别记录前次尝试结束和反馈到达的时间，反馈须在更新前可用。W3 要求策略版本确实改变，并在提交记录中保存新旧版本及读取闭包的哈希；读取闭包是策略运行时会读取的全部辅助状态。W4 要求更新只依赖当时可用信息，并记录事件顺序和本轮重置编号。W5 要求更新及后续尝试都发生在题目结束前；W6 用读取记录确认后续动作确实加载了新版本及其辅助状态。W7 固定历史、其余输入和随机化，检查新旧策略的动作分布是否改变；辅助状态也改变时，按合并状态分析。W8 统计更新、保留状态、重试和验证成本，并规定版本的到期、转移、回滚及迟到回调处理。", en: "W1 requires both attempts to share one immutable problem identity. W2 records attempt completion and feedback availability separately; feedback must be available before the update. W3 requires a real policy-version change and a commit record with hashes of both versions and their read closures, meaning all auxiliary state read by the policy. W4 restricts the update to then-available information and records event order and the current reset epoch. W5 places both the update and later attempt before problem termination. W6 verifies from read records that a later action actually loaded the new version and its auxiliaries. W7 holds history, other inputs, and randomization fixed to test whether the action distribution changed; changes to auxiliary state are analyzed as a bundled intervention. W8 counts update, retained-state, retry, and verification costs, with rules for expiry, transfer, rollback, and late callbacks." },
        steps: [
          { zh: "前后两次尝试属于同一道题，题目身份在过程中保持不变。", en: "Both attempts belong to the same problem, whose identity stays fixed throughout." },
          { zh: "分别记录前次尝试结束与反馈到达的时间。更新只能使用已经到达的反馈。", en: "Record attempt completion and feedback arrival separately. The update may use only feedback already available." },
          { zh: "策略版本确实发生变化。提交记录保存新旧版本及其读取闭包的哈希；读取闭包是策略运行时会读取的全部辅助状态。", en: "The policy version changes. The commit record stores hashes of both versions and their read closures: all auxiliary state read by the policy." },
          { zh: "更新只依赖当时可用的信息，并记录事件顺序与本轮重置编号，避免后来的信息影响先前提交。", en: "The update depends only on then-available information. Its event order and reset epoch are recorded so later information cannot select an earlier commit." },
          { zh: "更新和后续尝试都发生在题目解决、放弃或到达终止条件之前。", en: "Both the update and the later attempt occur before the problem is resolved, abandoned, or otherwise terminated." },
          { zh: "后续动作的读取记录确认：新策略版本及其辅助状态已经实际加载。", en: "A later action's read record confirms that the new policy version and its auxiliary state were actually loaded." },
          { zh: "固定历史、其余输入和随机化，比较新旧策略的动作分布。辅助状态也改变时，将其作为合并状态干预分析。", en: "Hold history, other inputs, and randomization fixed to compare old and new action distributions. If auxiliary state changes too, analyze the combined intervention." },
          { zh: "统计更新、保留状态、重试和验证成本，并规定版本何时到期、转移或回滚，以及如何拒绝上一轮重置前的迟到回调。", en: "Count update, retained-state, retry, and verification costs. Define version expiry, transfer, rollback, and rejection of late callbacks from an earlier reset epoch." }
        ],
        output: { zh: "输出是满足条件的严格功能 RTT 见证，或指出缺失条件及其对应失败类别。", en: "The output is a strict functional RTT witness, or a report of missing conditions and their failure categories." },
        boundary: { zh: "版本哈希核验状态变化，W7 核验动作输出分布变化；任务表现另设因果估计量。", en: "Version hashes check state change, W7 checks action-output distribution change, and task outcomes use a separate causal estimand." },
        reference: { label: "v4 §21", page: 45 }
      },
      {
        id: "rtt-policy-vs-search",
        title: { zh: "新提案与搜索工作区的区分", en: "Distinguishing fresh proposals from search workspaces" },
        purpose: { zh: "避免把搜索状态的变化误称为策略学习。", en: "Avoid calling changes to search state policy learning." },
        input: { zh: "输入是预尝试快照、可独立替换的策略版本和共同随机数条件。", en: "The input is a pre-attempt snapshot, independently swappable policy versions, and common-randomization conditions." },
        process: { zh: "恢复上下文、记忆、工作区和策略读取辅助状态，再只替换候选策略状态。比较任何更新搜索节点、追加反思或读取新记忆之前产生的新提案分布。若搜索树值、访问节点或缓存工具输出改变了后续选择，那属于工作区搜索机制；若提案与工作区都变，应分别报告两种作用。", en: "Restore context, memory, workspace, and policy-read auxiliaries, then swap only the candidate policy state. Compare fresh proposal distributions before reading updated search nodes, appended reflections, or new memory. Changes to tree values, visited nodes, or cached tool outputs belong to workspace search; when both proposal and workspace change, report both mechanisms." },
        output: { zh: "输出是策略状态、搜索工作区或二者混合的操作分类。", en: "The output classifies the operation as policy state, search workspace, or a combination." },
        boundary: { zh: "读取闭包保持一致时可单独归因于策略；闭包改变时按合并状态报告。", en: "With the read closure held fixed, the effect can be attributed to policy; when the closure changes, report the bundled state." },
        reference: { label: "v4 §22", page: 48 }
      },
      {
        id: "rtt-no-read",
        title: { zh: "无更新与精确空操作", en: "No update and exact no-op" },
        purpose: { zh: "显式表示系统收到反馈后选择不改变策略。", en: "Represent explicitly that the system chose not to change policy after feedback." },
        input: { zh: "输入是符合类型的反馈、当前策略版本和更新算子结果。", en: "The input is typed feedback, the current policy version, and the update-operator result." },
        process: { zh: "若门控拒绝更新，系统写入精确 no-op 结果，不创建虚假的后继版本，也不把拒绝伪装为成功提交。候选更新若未通过校验或提交，则隔离候选并恢复该策略事务的原状态。后续读轨迹必须标明读的是原版本。", en: "When a gate declines an update, the system records an exact no-op result, creates no fictitious successor version, and does not report a successful commit. A candidate that fails validation or commit is quarantined and the policy transaction restores its prior state. Later read traces must identify the original version." },
        output: { zh: "输出是无状态变化的明确收据，或一次完整提交的新策略版本。", en: "The output is an explicit receipt for no state change, or a new policy version from a complete commit." },
        boundary: { zh: "无操作记录保持版本不变；严格 RTT 更新路径要求非空后继状态，奖励方向由训练目标指定。", en: "A no-op records an unchanged version; a strict RTT update path requires a nonempty successor, while reward direction is set by the training objective." },
        reference: { label: "v4 §24", page: 53 }
      },
      {
        id: "rtt-operators",
        title: { zh: "更新算子与 RTT 轨迹", en: "Update operators and the RTT trace" },
        purpose: { zh: "说明不同参数更新方法如何受同一行为见证约束。", en: "Show how different parameter-update methods are governed by the same behavioral witness." },
        input: { zh: "输入是算子、受限反馈、更新前策略及其读取闭包。", en: "The input is an operator, bounded feedback, the prior policy, and its read closure." },
        process: { zh: "算子可以是梯度步、低秩适配器更新或其他有界变换，但更新须由许可反馈驱动并受预算与稳定性规则约束。系统记录提案、校验、提交和回滚各阶段，使算子结果不能绕过 W1–W8 的轨迹审计。", en: "An operator may be a gradient step, low-rank adapter update, or another bounded transformation, but it must be driven by admissible feedback and constrained by budget and stability rules. The system records proposal, validation, commit, and rollback so the operator cannot bypass the W1–W8 trace audit." },
        output: { zh: "输出是有界策略后继状态及可复核的更新收据。", en: "The output is a bounded successor policy state with an auditable update receipt." },
        boundary: { zh: "RTT 分类依据同题更新—复用轨迹和固定其他输入后的功能测试。", en: "RTT classification follows the within-problem update-and-reuse trace and a functional test with other inputs fixed." },
        reference: { label: "v4 §24", page: 53 }
      },
      {
        id: "rtt-functional-law",
        title: { zh: "固定输入下检验输出分布变化", en: "Test output-distribution change with inputs fixed" },
        purpose: { zh: "验证固定输入时策略更新是否改变动作输出分布，而不只看版本号。", en: "Verify whether a policy update changes the action-output distribution with inputs fixed, rather than merely observing a new version number." },
        input: { zh: "输入是可达动作历史、两个策略版本、相同的非策略状态和随机化方案。", en: "The input is a reached action history, two policy versions, identical non-policy state, and a shared randomization scheme." },
        process: { zh: "在同一可达历史下调用新旧策略，对比其动作输出分布，可计算总变差距离或使用预注册探针/状态交换测试。提示、上下文、记忆、搜索工作区、随机数和策略读取闭包等非目标输入必须固定。若闭包中的辅助载体也变化，测到的是合并有效状态的输出变化，不能单独归因于策略参数。", en: "At the same reached history, compare action-output distributions from the old and new policies using total variation or a registered probe/state-swap test. Non-target inputs such as prompt, context, memory, search workspace, randomization, and policy-read closure must remain fixed. If an auxiliary carrier in the closure also changes, the measured output change belongs to the bundled effective state, not policy parameters alone." },
        output: { zh: "输出是功能差异证据及测量不确定性，或零差异/归因不清的结果。", en: "The output is evidence of functional difference with measurement uncertainty, or a result showing zero difference or unclear attribution." },
        boundary: { zh: "动作分布比较控制提示、历史、状态和随机化；任务表现另行测量。", en: "Action-distribution comparisons control prompt, history, state, and randomization; task outcomes are measured separately." },
        reference: { label: "v4 §21", page: 46 }
      },
      {
        id: "rtt-identification",
        title: { zh: "因子设计识别因果作用", en: "Factorial design identifies causal effects" },
        purpose: { zh: "把“发生了策略更新”与“更新造成了结果变化”分开。", en: "Separate the occurrence of a policy update from the claim that it caused an outcome change." },
        input: { zh: "输入是预先定义的任务组、分配方案、结果指标和更新策略干预。", en: "The input is a prespecified task group, assignment scheme, outcome metric, and policy-update intervention." },
        process: { zh: "随机化或有依据的干预比较不同策略状态，同时控制问题分布、尝试预算及非目标载体。预先定义估计量，并检查共同支持与干预执行收据。因果效果取决于设计假设、样本和测量，不能从单条见证轨迹推出。", en: "Randomized or otherwise justified interventions compare policy states while controlling the problem distribution, attempt budget, and non-target carriers. Define the estimand in advance and inspect overlap and intervention receipts. A causal effect depends on design assumptions, samples, and measurement; one witness trace cannot establish it." },
        output: { zh: "输出是带估计目标和假设的策略干预因果效应。", en: "The output is a policy-intervention effect stated with its estimand and assumptions." },
        boundary: { zh: "预先定义策略动作和任务表现各自的估计量，并按相应干预设计报告。", en: "Define estimands for policy actions and task outcomes separately, and report each under its corresponding intervention design." },
        reference: { label: "v4 §23", page: 51 }
      },
      {
        id: "rtt-reset-budget",
        title: { zh: "重置隔离与泄漏审计", en: "Reset isolation and leakage audit" },
        purpose: { zh: "阻止旧状态、延迟回调或隐藏载体污染后续尝试。", en: "Prevent old state, late callbacks, or hidden carriers from contaminating later attempts." },
        input: { zh: "输入是尝试边界上的上下文、缓存、路由器、优化器、随机数和待处理回调状态。", en: "The input is context, caches, router, optimizer, random state, and pending callbacks at an attempt boundary." },
        process: { zh: "为策略状态及每个可读辅助载体声明独立版本、生命周期和重置纪元。重试前恢复注册快照，验证策略读取闭包并拒绝携带旧纪元的回调；所有状态保留、重试和核验成本记入预算。", en: "Declare separate versions, lifetimes, and reset epochs for policy state and every readable auxiliary carrier. Restore the registered snapshot before retry, verify the policy-read closure, and reject callbacks from an old epoch; charge retained-state, retry, and verification costs." },
        output: { zh: "输出是隔离通过的尝试快照与完整状态生命周期账本。", en: "The output is an isolated attempt snapshot and a complete state-lifetime ledger." },
        boundary: { zh: "重置覆盖完整可读状态；存储、重试和核验均计入生命周期预算。", en: "Reset covers the complete readable state; storage, retries, and verification are included in the lifetime budget." },
        reference: { label: "v4 §§24–25", page: 54 }
      },
      {
        id: "rtt-transaction-stop",
        title: { zh: "预算漂移、事务回滚与停止规则", en: "Budget drift, transactional rollback, and stop rules" },
        purpose: { zh: "确保候选适配失败不会留下半更新状态，也不会超额运行。", en: "Ensure failed adaptation leaves no partial policy state and execution does not exceed its budget." },
        input: { zh: "输入是注册预算、候选更新、执行账本和事务前状态。", en: "The input is a registered budget, candidate update, execution ledger, and pre-transaction state." },
        process: { zh: "在执行期间累计更新步数、令牌、延迟、状态字节、重试和验证成本，并在预算上限处停止。将候选状态隔离后执行校验；只有全部条件通过才原子提交。任一校验、完整性或预算门失败时回滚该策略事务、保存失败收据并禁止将候选用于后续动作。", en: "Accumulate update steps, tokens, latency, state bytes, retries, and verification cost during execution, and stop at registered limits. Quarantine the candidate and validate it; commit atomically only after every condition passes. Any validation, integrity, or budget failure rolls back the policy transaction, preserves a failure receipt, and prevents later actions from using the candidate." },
        output: { zh: "输出是完整提交的后继版本，或精确回滚到原状态并附停止收据。", en: "The output is a fully committed successor version, or an exact rollback to prior state with a stop receipt." },
        boundary: { zh: "事务完整性、任务效用、安全性和资源成本分别记录与评估。", en: "Transactional integrity, task utility, safety, and resource cost are recorded and evaluated separately." },
        reference: { label: "v4 §25", page: 54 }
      }
    ]
  },
  {
    id: "dual",
    title: { zh: "双状态适配：策略学习与权威记忆", en: "Dual-State Adaptation: Policy Learning and Authoritative Memory" },
    subtitle: { zh: "MMLA RTT Dual-State · MMLA v4 Part IV, §§68–86", en: "MMLA RTT Dual-State · MMLA v4 Part IV, §§68–86" },
    lead: {
      zh: "双状态架构让有界数值策略状态 Φ 在问题仍活动时吸收反馈，同时由可信生命周期独立提交一条完整类型化记忆行或精确 NULL。后续计算可以读取两者，但写入者、版本、重置、回滚和账本保持分立。",
      en: "The dual-state architecture lets bounded numerical policy state Φ absorb feedback while a problem remains active, while a trusted lifecycle independently commits one complete typed memory row or exact NULL. Later computation may read both, but their writers, versions, resets, rollback domains, and ledgers remain separate." },
    source: { file: "assets/papers/MMLA_RTT_Dual_State.pdf", label: "R02", page: 1 },
    sections: [
      {
        id: "dual-carriers",
        title: { zh: "两个载体与类型化读取视图", en: "Two carriers and typed read views" },
        purpose: { zh: "按因果角色区分策略状态和权威记忆。", en: "Distinguish policy state and authoritative memory by causal role." },
        input: { zh: "输入包括策略载体 Φ、记忆载体 M、当前上下文与读取权限。", en: "The input includes policy carrier Φ, memory carrier M, current context, and read permissions." },
        process: { zh: "Φ 是有界数值状态，影响新推理动作的策略分布；M 是有权威生命周期的类型化持久记录，可在之后被检索。一次视图可以列出二者版本与摘要，但读取视图不会合并各自的写权限、版本链或真实内容。", en: "Φ is bounded numerical state that affects the policy distribution for new reasoning actions; M is typed persistent data with an authoritative lifecycle that can be retrieved later. A view may list both versions and digests, but the view does not merge their write permissions, version chains, or contents." },
        output: { zh: "输出是明确标出载体来源、版本和允许读取字段的联合视图。", en: "The output is a joint view that identifies carrier source, version, and permitted fields." },
        boundary: { zh: "两类状态即使共置或出现在同一读取视图中，也保留各自的类型、权限和版本链。", en: "Even when co-located or present in one read view, the two state types retain their own types, permissions, and version chains." },
        reference: { label: "v4 §69", page: 141 }
      },
      {
        id: "dual-timeline",
        title: { zh: "细粒度因果时序", en: "Fine-grained causal timeline" },
        purpose: { zh: "确定同题适配和跨题记忆何时各自生效。", en: "Specify when within-problem adaptation and cross-problem memory each take effect." },
        input: { zh: "输入是固定版本视图、一次尝试、许可反馈和两个独立事件队列。", en: "The input is a pinned-version view, an attempt, admissible feedback, and two independent event queues." },
        process: { zh: "尝试开始时固定本次动作可见的 Φ 和 M 版本。反馈到达后可分别触发策略更新和记忆提案；策略后继只有在问题未解决的后续尝试实际读取后才形成严格 RTT 路径。记忆行提交按自己的授权和持久化顺序生效，并由其后的读取路径体现。", en: "At attempt start, pin the Φ and M versions visible to its actions. Admissible feedback may trigger independent policy-update and memory-proposal events; a policy successor forms a strict RTT path only when a later attempt on the unresolved problem actually reads it. A memory row takes effect according to its own authorization and durable-commit order, then appears through a later read path." },
        output: { zh: "输出是分别记录两个载体的版本时序、读路径和事件收据。", en: "The output is a version timeline, read path, and event receipt for each carrier." },
        boundary: { zh: "分别识别载体作用时，按各自版本、写入事件和后续读取路径建立证据链。", en: "To identify each carrier's effect, trace its version, write event, and later read path separately." },
        reference: { label: "v4 §70", page: 143 }
      },
      {
        id: "dual-algebras",
        title: { zh: "独立操作代数与精确 NULL", en: "Independent operation algebras and exact NULL" },
        purpose: { zh: "让策略更新与记忆提交遵守不同状态转移规则。", en: "Give policy updates and memory commits their own state-transition rules." },
        input: { zh: "输入是策略更新提案、记忆行候选及各自的当前版本。", en: "The input is a policy-update proposal, a memory-row candidate, and each carrier's current version." },
        process: { zh: "策略更新器只产生有界数值策略候选，可提交合法后继或保持不变。记忆路径由可信组装器校验类型与授权字段，形成完整候选行；事务控制器再按当前前态原子提交一行，或返回精确 NULL。每条路径分别维护版本与账本，不更新时保持对应状态原样。", en: "The policy updater produces a bounded numerical candidate, which may commit a legal successor or leave policy unchanged. On the memory path, a trusted assembler validates types and authorized fields to form a complete candidate row; a transaction controller atomically commits one row against the current predecessor or returns exact NULL. Each path maintains its own versions and ledger, with no update leaving the corresponding state unchanged." },
        output: { zh: "输出分别是策略后继/无操作，以及完整记忆行/精确 NULL。", en: "The outputs are, separately, a policy successor/no-op and a complete memory row/exact NULL." },
        boundary: { zh: "NULL 记录记忆状态未变更；事件账本同时记录本次计算、校验和资源消耗。", en: "NULL records an unchanged memory state; the event ledger also records computation, validation, and resource use." },
        reference: { label: "v4 §71", page: 145 }
      },
      {
        id: "dual-strict-rtt",
        title: { zh: "严格 RTT、记忆适配与组合路径", en: "Strict RTT, memory adaptation, and composition" },
        purpose: { zh: "按实际读取载体标记机制，而不是按组件名称推断。", en: "Classify mechanisms by the carrier actually read, rather than inferring from component names." },
        input: { zh: "输入是状态变更收据、后续动作读轨迹和当前问题生命周期。", en: "The input is state-change receipts, later-action read traces, and the current problem lifecycle." },
        process: { zh: "检查策略变化是否通过 W1–W8 并在同题未解决时被后续动作读取。独立检查记忆候选是否通过可信组装提交，并被之后的检索读取。若 Φ 与 M 都改变，则将其标为组合路径，并保留可分别交换、回滚和计费的因素。", en: "Check whether a policy change satisfies W1–W8 and is read by a later action while the same problem remains unresolved. Separately check whether a memory candidate passed trusted assembly and was retrieved later. If both Φ and M change, label the path as composed and retain factors that can be separately swapped, rolled back, and costed." },
        output: { zh: "输出是严格 RTT、记忆复用、二者组合或未证实的路径分类。", en: "The output classifies the path as strict RTT, memory reuse, a combination, or unverified." },
        boundary: { zh: "机制归因串联提案、提交和实际读取收据；因果效果由单独的干预设计识别。", en: "Mechanism attribution links proposal, commit, and actual-read receipts; causal effects are identified by a separate intervention design." },
        reference: { label: "v4 §72", page: 147 }
      },
      {
        id: "dual-reset-swap",
        title: { zh: "交换、快照与分域回滚", en: "Swaps, snapshots, and domain-specific rollback" },
        purpose: { zh: "让状态对照不串入另一载体的历史。", en: "Keep state comparisons from importing the other carrier's history." },
        input: { zh: "输入是策略和记忆版本、重置纪元、授权快照及目标因子。", en: "The input is policy and memory versions, reset epochs, authorized snapshots, and the target factor." },
        process: { zh: "策略交换只替换 Φ，并固定记忆、上下文及策略读取闭包；记忆交换只替换 M，并固定 Φ 和检索条件。各自重置、快照及回滚都带独立纪元与授权收据，旧回调不能重新带入过期版本。联合视图可引用两个版本，却不得把一方回滚隐式扩展到另一方。", en: "A policy swap replaces only Φ while fixing memory, context, and policy-read closure; a memory swap replaces only M while fixing Φ and retrieval conditions. Each reset, snapshot, and rollback carries its own epoch and authorization receipt, and stale callbacks cannot restore expired versions. A joint view may reference both versions but cannot make one carrier's rollback silently apply to the other." },
        output: { zh: "输出是载体隔离的干预对照及单调版本/回滚记录。", en: "The output is a carrier-isolated intervention contrast and monotone version/rollback records." },
        boundary: { zh: "分别估计载体作用时，策略与记忆各自独立交换，并固定另一载体。", en: "To estimate each carrier's effect separately, swap policy and memory independently while holding the other carrier fixed." },
        reference: { label: "v4 §73", page: 148 }
      },
      {
        id: "dual-compress-comparator",
        title: { zh: "Compress-All 对照", en: "The Compress-All comparator" },
        purpose: { zh: "比较按需分离状态与统一压缩历史的方案。", en: "Compare separated, on-demand state with a single compressed-history approach." },
        input: { zh: "输入是在相同任务、预算和读取时点下的分离载体方案与压缩全部历史方案。", en: "The input is a separated-carrier design and a compress-all-history design under the same tasks, budget, and read points." },
        process: { zh: "对照组将可用历史压缩为单一摘要并在后续提示中复用；分离组分别保留策略更新与可授权检索的记忆记录。固定任务信息、模型、生成预算、训练信息和评测协议，再比较质量、成本与错误类型。", en: "The comparator compresses available history into one summary for later prompts; the separated design retains distinct policy updates and authorized retrievable memory. Fix task information, model, generation budget, training information, and evaluation protocol, then compare quality, cost, and error types." },
        output: { zh: "输出是针对指定协议的质量与资源比较。", en: "The output is a quality and resource comparison for the specified protocol." },
        boundary: { zh: "按共同任务、预算和读取时点比较方案，并将归档检索等资源纳入账本。", en: "Compare designs under common tasks, budgets, and read points, including archive retrieval and other resources in the ledger." },
        reference: { label: "v4 §74", page: 150 }
      },
      {
        id: "dual-drift",
        title: { zh: "策略漂移与双状态交互", en: "Policy drift and dual-state interaction" },
        purpose: { zh: "分析策略变化后，记忆提案和读取如何随之变化。", en: "Analyze how memory proposals and reads change as policy changes." },
        input: { zh: "输入是策略版本、记忆策略、提案与检索过程及各自漂移账本。", en: "The input is policy versions, memory policy, proposal and retrieval processes, and separate drift ledgers." },
        process: { zh: "分别跟踪策略对新动作分布的影响，以及提案器/检索器由策略诱发的变化。界定策略造成的存储分布改变与记忆造成的读取改变，并用独立交换或分层分析检查交互和累计漂移。为两个载体分别设置预算、刷新和停止条件。", en: "Track the policy's effect on new action distributions separately from policy-induced changes to proposal and retrieval processes. Define how policy changes storage distributions and how memory changes reads; inspect interaction and accumulated drift using independent swaps or stratified analysis. Set separate budgets, refresh rules, and stopping conditions for both carriers." },
        output: { zh: "输出是带条件和边界的漂移/交互分析。", en: "The output is a drift and interaction analysis with stated conditions and boundaries." },
        boundary: { zh: "漂移界针对声明的载体、交互过程、假设和时间范围。", en: "Drift bounds apply to the declared carriers, interaction process, assumptions, and time horizon." },
        reference: { label: "v4 §75", page: 151 }
      },
      {
        id: "dual-factorial",
        title: { zh: "策略 × 记忆二乘二因子设计", en: "Policy × memory two-by-two factorial" },
        purpose: { zh: "分别估计策略作用、记忆作用及其交互。", en: "Estimate policy effects, memory effects, and their interaction separately." },
        input: { zh: "输入是策略开/关与记忆开/关形成的四个随机化条件。", en: "The input is four randomized conditions formed by policy on/off and memory on/off." },
        process: { zh: "在同一预注册协议内运行四格：Φ−M−（基线）、Φ+M−（仅策略）、Φ−M+（仅记忆）、Φ+M+（两者）。分别比较固定记忆时的策略效应、固定策略时的记忆效应；交互项用差中之差 [Y11−Y10]−[Y01−Y00] 计算，而不是把四格汇总成一条总收益。固定任务分组和资源定义，并记录载体版本、实际读取、失败与成本；观察结果前规定估计目标、排除条件和停止阈值。", en: "Run four cells under one preregistered protocol: Φ−M− (baseline), Φ+M− (policy only), Φ−M+ (memory only), and Φ+M+ (both). Estimate the policy effect at fixed memory and the memory effect at fixed policy; compute the interaction as the difference-in-differences [Y11−Y10]−[Y01−Y00], rather than collapsing all four cells into one total-gain claim. Fix task grouping and resource definitions, and record carrier versions, actual reads, failures, and costs; specify estimands, exclusions, and stop thresholds before observing outcomes." },
        output: { zh: "输出是该实验设计下的两个主效应、交互效应和不确定性。", en: "The output is the two main effects, interaction effect, and uncertainty under that experimental design." },
        boundary: { zh: "四格设计分别呈现策略主效应、记忆主效应和两者的交互项。", en: "The four-cell design reports the policy main effect, memory main effect, and their interaction separately." },
        reference: { label: "v4 §76", page: 153 }
      },
      {
        id: "dual-privilege-ledgers",
        title: { zh: "权限隔离、账本与恢复", en: "Privilege isolation, ledgers, and recovery" },
        purpose: { zh: "确保模型提案不能自行取得权威记忆写入权限。", en: "Ensure model proposals cannot grant themselves authority to write memory." },
        input: { zh: "输入是非可信语义候选、认证上下文、当前权威行和分离的权限身份。", en: "The input is an untrusted semantic candidate, authenticated context, current authoritative row, and separated privilege identities." },
        process: { zh: "可信组装器从当前状态与固定策略生成租户、ACL、版本、保护、来源和收据等受保护字段；提案文字只能请求操作。独立账本记录策略更新、记忆事件、读视图和提交结果，并支持按事件键幂等恢复。发生越权、版本冲突、持久化或队列失败时停止新暴露，校验最后完整根并只恢复到完整旧状态或完整新状态。", en: "The trusted assembler derives protected tenant, ACL, version, protection, provenance, and receipt fields from current state and fixed policy; proposal text can only request an operation. Separate ledgers record policy updates, memory events, read views, and commit results, supporting idempotent recovery by event key. On privilege, version, durability, or queue failure, halt new exposures, validate the last complete root, and recover only to a complete old or complete new state." },
        output: { zh: "输出是完整记忆行或精确 NULL，并附可恢复的授权及事件账本。", en: "The output is a complete memory row or exact NULL, with recoverable authorization and event ledgers." },
        boundary: { zh: "权限隔离以可信组装器、策略、密钥和验证器组成的边界为前提，并由授权与提交收据落实。", en: "Privilege isolation assumes a boundary formed by the trusted assembler, policy, keys, and validators, and is realized through authorization and commit receipts." },
        reference: { label: "v4 §§78, 80", page: 155 }
      }
    ]
  },
  {
    id: "consolidation",
    title: { zh: "完成片段巩固：因果分段与递归提交", en: "Completed-Segment Consolidation: Causal Segmentation and Recursive Commit" },
    subtitle: { zh: "Completed Segment Consolidation · MMLA v4 Part V, §§87–106", en: "Completed Segment Consolidation · MMLA v4 Part V, §§87–106" },
    lead: {
      zh: "CSBC 在一个片段完整结束后，才允许对该片段做局部双向回顾并提出记忆事件；部署输出仍必须遵循因果前缀，权威写入则逐事件递归提交。分段边界、重叠、携带状态、教师监督、队列和可信提交都是协议的一部分。",
      en: "CSBC allows local bidirectional retrospective processing only after a segment is complete; deployment outputs must still follow the causal prefix, while authoritative writes commit recursively event by event. Boundaries, overlap, carry, teacher supervision, queues, and trusted commit all belong to the protocol." },
    source: { file: "assets/papers/Completed_Segment_Consolidation.pdf", label: "Completed Segment Consolidation", page: 1 },
    sections: [
      {
        id: "csbc-five-clocks",
        title: { zh: "五个时钟与逻辑日程", en: "Five clocks and the logical schedule" },
        purpose: { zh: "用五种时钟描述令牌、边界、事件、训练监督和服务时间，并区分因果顺序与工作者完成顺序。", en: "Use five clocks for tokens, boundaries, events, training supervision, and service time, separating causal order from worker completion order." },
        input: { zh: "输入是令牌采样与读取、片段边界、按序事件、训练监督活动和服务队列记录。", en: "The input is token sampling and reads, segment boundaries, ordered events, training-supervision activity, and service-queue records." },
        process: { zh: "五种时钟是：令牌时间 t 排序 logits、采样、输出和读取收据；边界时间 b 排序已闭合核心；逻辑事件时间 (b,j) 按字典序排列片段内事件；监督时间 s 排序离线教师标签与参数更新；服务时间 κ 记录入队、启动、完成、持久发布和暴露。部署偏序要求令牌输出先于边界闭合，闭合先于视图与编码，编码先于 (b,1)…(b,m)，事件提交再先于合格读取；训练监督有独立偏序，不进入评估回合的部署轨迹。工作者可乱序完成，但发布仍按逻辑事件次序；单个服务任务须满足入队≤启动≤完成≤发布≤暴露。", en: "The five clocks are: token time t orders logits, samples, emissions, and read receipts; boundary time b orders completed cores; logical event time (b,j) orders events within a segment lexicographically; supervision time s orders offline teacher labels and parameter updates; service time κ records enqueue, start, finish, durable publication, and exposure. Deployment precedence requires token emission before boundary closure, closure before view and encoding, encoding before (b,1)…(b,m), and event commit before an eligible read; training supervision has its own order and is outside the evaluated episode's deployment trace. Workers may finish out of order, but publication follows logical event order; each service job satisfies enqueue≤start≤finish≤publish≤exposure." },
        output: { zh: "输出是有因果先后关系的事件时序与版本可见性记录。", en: "The output is a causally ordered event timeline and version-visibility record." },
        boundary: { zh: "因果顺序由五种时钟和事件收据描述；服务时钟用于记录等待、发布与暴露延迟。", en: "Causal order is described by the five clocks and event receipts; the service clock records waiting, publication, and exposure latency." },
        reference: { label: "v4 §89", page: 174 }
      },
      {
        id: "csbc-suffix-invariance",
        title: { zh: "因果后缀不变性", en: "Causal suffix invariance" },
        purpose: { zh: "确保未观察到的未来不会改变已输出前缀。", en: "Ensure unobserved future input cannot change an already emitted prefix." },
        input: { zh: "输入是拥有相同已观察前缀、但后续令牌不同的两次执行。", en: "The input is two executions with the same observed prefix but different later tokens." },
        process: { zh: "比较两次执行截至该前缀的边界决策、生成输出、状态读取和外部可见结果。边界规则只能依赖当时已观测信息，不能偷看后一个令牌来决定何时闭合。审计数据访问图、缓存键、路由和教师特征的依赖，确保未来标签也不能间接参与。", en: "Compare boundary decisions, generated outputs, state reads, and externally visible results through that prefix. Boundary rules may depend only on information observed so far; they cannot peek at the next token to decide when to close. Audit data-access graphs, cache keys, routing, and teacher-feature dependencies so future labels cannot enter indirectly." },
        output: { zh: "输出是在假设与被审计接口范围内的前缀一致性判定。", en: "The output is a prefix-consistency determination within the stated assumptions and audited interfaces." },
        boundary: { zh: "前缀一致性范围由部署依赖清单、访问接口和可观测输出共同界定。", en: "The scope of prefix consistency is defined by the deployment dependency manifest, access interfaces, and observable outputs." },
        reference: { label: "v4 §90", page: 176 }
      },
      {
        id: "csbc-local-bidirectional",
        title: { zh: "闭合后才做局部双向回顾", en: "Local bidirectional review only after closure" },
        purpose: { zh: "在允许片段内双向处理的同时，维持外部生成的因果性。", en: "Permit bidirectional processing within a segment while preserving causal generation externally." },
        input: { zh: "输入是已经闭合的片段、其边界收据和有界的局部编码器。", en: "The input is a completed segment, its boundary receipt, and a bounded local encoder." },
        process: { zh: "编码器只在闭合后对该片段的有限令牌视图运行，可以回看片段内部的左右文来提出摘要或事件候选。后续分段按在线前缀顺序生成，不可读取尚未闭合的后缀。把离线教师或回顾特征标成训练侧数据，并在部署路径核验其不可访问。", en: "Only after closure does the encoder run over the segment's finite token view, using internal left and right context to propose summaries or event candidates. Later segments are generated in online prefix order and cannot read an unclosed suffix. Mark offline teacher or retrospective features as training-side data and verify they are inaccessible to deployment." },
        output: { zh: "输出是局部回顾候选，以及边界清楚的后续因果读取视图。", en: "The output is a local retrospective candidate and a later causal read view with explicit boundaries." },
        boundary: { zh: "回顾编码只处理已闭合片段；生成历史保持不可变，候选经授权和校验后进入事件提案。", en: "Retrospective encoding processes only completed segments; generation history remains immutable, and candidates enter event proposals after authorization and validation." },
        reference: { label: "v4 §90", page: 177 }
      },
      {
        id: "csbc-boundaries-overlap",
        title: { zh: "固定/自适应边界、重叠与有界携带", en: "Fixed/adaptive boundaries, overlap, and bounded carry" },
        purpose: { zh: "定义片段怎样闭合以及跨边界信息如何受限。", en: "Define how segments close and how cross-boundary information is bounded." },
        input: { zh: "输入是已观察令牌、边界策略、重叠长度及类型化携带状态。", en: "The input is observed tokens, a boundary policy, overlap length, and typed carry state." },
        process: { zh: "固定边界按预定长度闭合；自适应边界只能使用已观察前缀的因果规则。相邻视图可包含有限重叠供局部解释，但每个事件必须指定唯一核心所有者；跨界未完成结构只通过有类型和容量上限的 carry 延续。达到carry上限、关闭策略不确定或检测失败时，按协议停止或返回显式失败。", en: "Fixed boundaries close at a declared length; adaptive boundaries use only causal rules over the observed prefix. Neighboring views may contain finite overlap for local interpretation, but each event must have one unique core owner; unfinished cross-boundary structures continue only through typed, capped carry. On carry overflow, uncertain closure, or detector failure, stop or return an explicit protocol failure." },
        output: { zh: "输出是闭合片段序列、有限重叠和明确归属的跨界状态。", en: "The output is a sequence of closed segments with finite overlap and explicitly owned cross-boundary state." },
        boundary: { zh: "片段长度决定闭合延迟与局部计算，重叠和 carry 决定重复证据量与跨界状态容量。", en: "Segment length sets closure delay and local computation; overlap and carry set duplicated evidence and cross-boundary state capacity." },
        reference: { label: "v4 §92", page: 180 }
      },
      {
        id: "csbc-ownership-dedup",
        title: { zh: "唯一所有者、去重键与终态回执", en: "Unique owner, deduplication key, and terminal receipt" },
        purpose: { zh: "让重试和并发处理不会把同一事件写入两次。", en: "Prevent retries and concurrent processing from writing the same event twice." },
        input: { zh: "输入是带规范锚点的事件候选、唯一核心归属和稳定幂等键。", en: "The input is an event candidate with a canonical anchor, unique core ownership, and a stable idempotence key." },
        process: { zh: "从规范来源、锚点和租户范围构造不依赖工作者或墙钟的幂等键。对同一键登记唯一终态结果，包括成功提交或精确 NULL；重试读取并返回该终态。跨重叠视图遇到相同事件时，由唯一核心所有者提交，其他视图只能引用该事件。", en: "Construct an idempotence key from canonical source, anchor, and tenant scope, independent of worker or wall-clock time. Record one terminal result per key, including successful commit or exact NULL; retries return that result. When overlapping views contain the same event, only its unique core owner may submit it and other views may only refer to it." },
        output: { zh: "输出是每个事件键至多一个权威终态结果及可审计重试记录。", en: "The output is at most one authoritative terminal result per event key, with auditable retry records." },
        boundary: { zh: "唯一核心归属、稳定幂等键与每键终态账本共同确定每个事件的权威结果。", en: "Unique core ownership, a stable idempotence key, and a terminal ledger per key jointly determine each event's authoritative result." },
        reference: { label: "v4 §93", page: 182 }
      },
      {
        id: "csbc-recursive-commit",
        title: { zh: "事件递归提交与真实前驱", en: "Event-recursive commit and actual predecessors" },
        purpose: { zh: "保证同一片段的多条事件按逻辑顺序看到前一条真实结果。", en: "Ensure multiple events from one segment see the actual result of their logical predecessor." },
        input: { zh: "输入是按确定逻辑顺序排列的事件、初始权威根和每事件目标集合。", en: "The input is logically ordered events, an initial authoritative root, and a target set for each event." },
        process: { zh: "每个事件从当前已提交根读取，并在通过校验后原子发布完整行或精确 NULL，形成下一事件的前驱状态。若事件失败为 NULL，递归处理仍从未变更的当前根继续；不同工作者的完成先后不能改变逻辑顺序。跨多个事件时允许可见前缀提交，除非另有明示的有界多行事务协议。", en: "Each event reads the currently committed root and, after validation, atomically publishes a complete row or exact NULL, forming the next event's predecessor state. If an event returns NULL, recursion continues from the unchanged current root; worker completion order cannot change logical order. Across events, a committed prefix may be visible unless an explicit bounded multi-row transaction protocol is added." },
        output: { zh: "输出是有前驱收据的串行事件结果序列和当前完整权威根。", en: "The output is a serial event-result sequence with predecessor receipts and the current complete authoritative root." },
        boundary: { zh: "事件序列按逻辑顺序递归推进并形成已提交前缀；跨行全有或全无由明示的有界事务协议定义。", en: "The event sequence advances recursively in logical order and forms a committed prefix; all-or-nothing behavior across rows is defined by an explicit bounded transaction protocol." },
        reference: { label: "v4 §94", page: 183 }
      },
      {
        id: "csbc-async-pinning",
        title: { zh: "异步处理、兼容性与固定读取版本", en: "Asynchronous processing, compatibility, and pinned reads" },
        purpose: { zh: "允许后台巩固，同时让每次生成都有确定的数据视图。", en: "Allow background consolidation while giving each generation a definite data view." },
        input: { zh: "输入是异步队列、待处理事件、基索引版本和生成读取请求。", en: "The input is an asynchronous queue, pending events, base-index version, and generation read request." },
        process: { zh: "后台编码和验证可与后续工作异步进行，但提交仍按事件依赖、租户及前驱顺序串行化。生成开始时固定并记录可读的权威行、索引和策略版本；索引只是提示，返回内容须对当前行重新验证。提交后新版本只进入其后固定的读取视图，不追溯修改既有读视图或已发出的文本。", en: "Background encoding and validation may run asynchronously, but commits are serialized by event dependencies, tenant, and predecessor order. At generation start, pin and record readable authoritative rows, index, and policy versions; an index is only a hint and returned content must be revalidated against the current row. New committed versions enter only later pinned read views and do not retroactively alter prior views or emitted text." },
        output: { zh: "输出是带版本清单的固定读取视图及因果一致的异步提交记录。", en: "The output is a pinned read view with a version manifest and causally consistent asynchronous commit records." },
        boundary: { zh: "异步工作按逻辑前驱校验并由序列器发布；队列积压、等待和重试进入服务账本。", en: "Asynchronous work is validated against logical predecessors and published by a sequencer; backlog, waiting, and retries enter the service ledger." },
        reference: { label: "v4 §95", page: 185 }
      },
      {
        id: "csbc-teacher-amputation",
        title: { zh: "隔离训练用未来信息并审计访问", en: "Isolate future information for training and audit access" },
        purpose: { zh: "确保教师标签、未来分支及其衍生输入不会进入部署行为。", en: "Ensure teacher labels, future branches, and their derived inputs cannot enter deployment behavior." },
        input: { zh: "输入是离线教师标签、训练/校准/评估回合、冻结工件和运行时访问记录。", en: "The input is offline teacher labels, training/calibration/evaluation episodes, frozen artifacts, and runtime access records." },
        process: { zh: "未来答案、教师标签、评估器输出、分支标识及其派生缓存只可用于训练监督；部署工件的可执行依赖图必须移除这些对象及其访问路径。按源回合/来源族拆分数据，并在最终评测打开前冻结参数、特征模式、阈值和依赖清单。审计数据加载器、检索库、缓存、环境变量和远程服务的实际读取；通过同前缀换后缀测试及访问拒绝收据检查未来信息是否产生影响。", en: "Future answers, teacher labels, evaluator outputs, branch identifiers, and derived caches may be used only for training supervision; the deployment artifact's executable dependency graph must remove these objects and their access paths. Split data by source episode/family and freeze parameters, feature schema, thresholds, and dependency manifest before opening final evaluation data. Audit actual reads by loaders, retrieval stores, caches, environment variables, and remote services; use same-prefix suffix swaps and access-denial receipts to check for future-information effects." },
        output: { zh: "输出是与未来信息隔离的部署工件、访问依赖清单和泄漏审计收据。", en: "The output is a deployment artifact isolated from future information, with an access-dependency manifest and leakage-audit receipts." },
        boundary: { zh: "隔离审计结合冻结依赖清单、运行时访问记录和同前缀换后缀检查。", en: "Isolation audit combines a frozen dependency manifest, runtime access records, and same-prefix suffix-swap checks." },
        reference: { label: "v4 §91", page: 179 }
      },
      {
        id: "csbc-cost-queue",
        title: { zh: "成本、延迟与队列稳定性", en: "Cost, latency, and queue stability" },
        purpose: { zh: "把巩固服务的工作量和等待成本完整暴露。", en: "Expose the full work and waiting cost of consolidation service." },
        input: { zh: "输入是闭合速率、片段/重叠长度、事件与目标数、编码/验证/提交时延及服务容量。", en: "The input is closure rate, segment/overlap sizes, event and target counts, encoding/validation/commit latency, and service capacity." },
        process: { zh: "逐项计量局部双向编码、carry、事件化、路由、候选构造、重放、验证、持久提交、归档/索引访问、重试、能耗代理和峰值临时内存。暴露延迟按闭合、排队、处理、提交和固定视图的依赖路径计算。只有最坏服务工作量低于长期到达能力且队列容量有限时，才可在给定假设下推出有限等待界。", en: "Measure local bidirectional encoding, carry, eventization, routing, candidate construction, replay, validation, durable commit, archive/index access, retries, energy proxies, and peak scratch memory. Exposure delay follows the dependency path through closure, queueing, processing, commit, and view pinning. A finite wait bound follows only under stated assumptions when worst-case service work is below sustained arrival capacity and queue capacity is bounded." },
        output: { zh: "输出是可核算的资源与延迟账本，以及条件化的队列界。", en: "The output is an auditable resource and latency ledger with a conditional queue bound." },
        boundary: { zh: "资源与队列结论依据声明的片段、事件、服务容量和重试上限条件计算。", en: "Resource and queue conclusions are calculated under declared segment, event, service-capacity, and retry bounds." },
        reference: { label: "v4 §96", page: 186 }
      },
      {
        id: "csbc-authority-recovery",
        title: { zh: "权限边界、恢复与停止条件", en: "Authority boundaries, recovery, and stop conditions" },
        purpose: { zh: "让语义候选和服务故障都不能破坏权威状态。", en: "Prevent semantic candidates and service failures from corrupting authoritative state." },
        input: { zh: "输入是回顾编码器提出的候选、可信策略、当前行快照、队列和审计状态。", en: "The input is a retrospective candidate, trusted policy, current-row snapshot, queue, and audit state." },
        process: { zh: "提案组件只能提供有界语义内容和来源跨度，可信组装器独立确定租户、ACL、版本、保护、回滚和收据；事务控制器检查完整候选及前态后，原子提交一行或返回 NULL。发生未来泄漏、跨租户状态混入、失序前驱、队列过载或提交崩溃时，停止可疑版本的新读取，保留不可变账本并恢复到最后一个完整根。索引等派生视图从已验证当前行重建，修正也作为新的授权事件写入。", en: "Proposal components provide only bounded semantic content and source spans; the trusted assembler independently derives tenant, ACL, version, protection, rollback, and receipt fields. The transaction controller checks the complete candidate and predecessor before atomically committing one row or returning NULL. On future leakage, cross-tenant state, out-of-order predecessors, queue overload, or commit crash, stop new reads of suspect versions, preserve immutable ledgers, and recover to the last complete root. Rebuild derived views such as indexes from validated current rows, and record corrections as new authorized events." },
        output: { zh: "输出是恢复后的完整权威根，或停止执行并保留失败、重试与审计记录。", en: "The output is a recovered complete authoritative root, or halted execution with failure, retry, and audit records preserved." },
        boundary: { zh: "权威提交依赖可信组装与验证边界；语义内容按声明的来源和应用校验规则评估。", en: "Authoritative commit depends on the trusted assembly and validation boundary; semantic content is evaluated under declared provenance and application checks." },
        reference: { label: "v4 §§97, 100–106", page: 189 }
      }
    ]
  }
);
