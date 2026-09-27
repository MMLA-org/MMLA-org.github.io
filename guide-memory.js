window.MMLA_GUIDE_PARTS = window.MMLA_GUIDE_PARTS || [];
window.MMLA_GUIDE_PARTS.push(
  {
    id: 'rows',
    title: { zh: '原子记忆行', en: 'Atomic Memory Rows' },
    subtitle: { zh: '把可变记忆定义为有界、完整且可核验的状态单元', en: 'A bounded, complete, and checkable unit of mutable memory' },
    lead: {
      zh: 'Atomic Memory Rows（AMR）规定一条记录如何成为系统当前采信的状态。权威记忆是唯一能决定系统当前认可哪条记录及其内容的常驻状态。每行同时保存规范内容（规范化、便于人读和精确比较的字段）与神经表示（供模型或检索使用的数值编码）；固定长度的完整行是发布单位。模型只能提出候选，受信任的组装器校验并构造完整候选行，事务控制器再原子发布整行。行内收据是绑定内容、版本和检查结果的固定大小校验记录；事实真伪需结合来源和语义任务另行评估。',
      en: 'Atomic Memory Rows (AMR) specifies how a record becomes the state a system currently accepts. Authoritative memory is the resident state that alone determines which record and content the system currently recognizes. Each row holds canonical content (normalized fields that people can read and compare exactly) and a neural representation (numeric encoding for a model or retrieval); the fixed-length complete row is the publication unit. The model may only propose a candidate: a trusted assembler validates and constructs the complete candidate row, then a transaction controller atomically publishes it. A row receipt is a fixed-size verification record binding content, version, and checks; fact truth is assessed separately through provenance and semantic task evaluation.'
    },
    source: { file: 'https://github.com/MMLA-org/mmla-memory/raw/main/Atomic_Memory_Rows.pdf', label: 'Atomic Memory Rows / R02', page: 1 },
    sections: [
      {
        id: 'rows-authority',
        title: { zh: '先区分权威状态与派生信息', en: 'Separate authority from derived information' },
        purpose: { zh: '界定哪些状态可以决定当前对象的值、删除状态和访问结果。', en: 'Define which state can determine an object’s current value, deletion status, and access result.' },
        input: { zh: '系统盘点所有可变状态载体，并为每个载体声明容量、寿命、权限和更新规则。', en: 'The system inventories every mutable state carrier and declares its capacity, lifetime, authority, and update rule.' },
        process: { zh: '只有固定表中的有效行能声明对象当前状态。索引、路由结果和缓存只是提示，每次命中都须重新核对当前行；归档、审计日志和模型状态分别管理与计费。', en: 'Only a valid row in the fixed table can declare an object’s current state. Indexes, routes, and caches are hints whose hits must be checked against the current row; archives, audit logs, and model state are managed and charged separately.' },
        output: { zh: '得到权威行与非权威派生载体的明确边界。', en: 'The result is an explicit boundary between authoritative rows and non-authoritative derived carriers.' },
        boundary: { zh: '每次经索引或别名找到记录后，都要核对当前行的租户、身份、版本和状态；凡能独立改变结果的可变载体，都须纳入权威状态与提交边界。', en: 'After an index or alias finds a record, recheck the current row’s tenant, identity, version, and status. Any mutable carrier that can independently change the result belongs inside the authority and commit boundary.' },
        reference: { label: 'v4 §33, §34', page: 70 }
      },
      {
        id: 'rows-schema',
        title: { zh: '完整行的类型与状态', en: 'Complete row type and status' },
        purpose: { zh: '用固定模式表示一条记录的内容、身份、来源和一致性。', en: 'Represent a record’s content, identity, provenance, and consistency in a fixed schema.' },
        input: { zh: '模式给出有限宽度的槽位、租户、对象、版本、状态和各字段编码。', en: 'The schema supplies finite-width encodings for slots, tenants, objects, versions, statuses, and fields.' },
        process: { zh: '一行由受信控制块、规范内容、神经表示、来源信息、有限回滚历史和一致性收据组成。收据是固定长度的校验记录，绑定行内容、版本关系及所执行的检查，便于发现错配或篡改；事实依据由来源和语义任务评估。固定序列化器将合法行编码为同一长度的字节串；状态区分空槽、活动记录、删除墓碑和隔离记录。', en: 'A row contains a trusted control block, canonical content, neural representation, provenance, bounded rollback history, and a consistency receipt. The receipt is a fixed-length verification record that binds row content, version lineage, and performed checks, helping detect mismatch or tampering; factual support is assessed through provenance and semantic tasks. A fixed serializer encodes every valid row to the same length; statuses distinguish an empty slot, a live record, a deletion tombstone, and a quarantined record.' },
        output: { zh: '得到唯一的完整行格式及可解析的有限状态。', en: 'The result is one complete row format and a finite set of parseable states.' },
        boundary: { zh: '模式的保证适用于按同一字段顺序、长度、规范化和填充规则序列化的行；用边界样例检查解析与序列化的一致性。', en: 'The schema applies to rows serialized with the same field order, lengths, normalization, and padding rules; check parser and serializer agreement with boundary cases.' },
        reference: { label: 'v4 §34', page: 72 }
      },
      {
        id: 'rows-budget',
        title: { zh: '位预算与具体配置', en: 'Bit budget and concrete profile' },
        purpose: { zh: '让“有界记忆”成为可核算的精确容量约束。', en: 'Turn “bounded memory” into an exact, auditable capacity constraint.' },
        input: { zh: 'AMR-1 固定 256 个槽位，并为行字段、回滚历史和两类索引规定字节数。', en: 'AMR-1 fixes 256 slots and specifies byte counts for row fields, rollback history, and two indexes.' },
        process: { zh: '每行 6,688 字节，由控制块 256、规范内容 1,104、神经表示 784、来源 192、两个各 2,048 字节的回滚快照及收据 256 组成。每槽索引包含最多 9 条规范索引项（每条 112 字节，主键加 8 个别名）和 1 条 336 字节神经索引项，因此 256 行共 1,712,128 字节，索引共 344,064 字节，总计 2,056,192 字节（1.9609375 MiB）。', en: 'Each 6,688-byte row contains a 256-byte control block, 1,104 bytes of canonical content, 784 bytes of neural representation, 192 bytes of provenance, two 2,048-byte rollback snapshots, and a 256-byte receipt. Each slot’s indexes allow up to nine 112-byte canonical entries (primary key plus eight aliases) and one 336-byte neural entry, so 256 rows use 1,712,128 bytes and the indexes use 344,064 bytes, for 2,056,192 bytes total (1.9609375 MiB).' },
        output: { zh: '得到可复算的 AMR-1 常驻容量以及逐项行和索引预算。', en: 'The result is a reproducible AMR-1 resident capacity with itemized row and index budgets.' },
        boundary: { zh: '这项总数含常驻行与两种基础索引；工作缓冲、归档和审计账本另计。运行性能需针对具体实现测量读写延迟、能耗和吞吐。', en: 'This total includes resident rows and both base indexes; working buffers, archives, and audit ledgers are separate. Measure read/write latency, energy, and throughput for the concrete implementation.' },
        reference: { label: 'v4 §35, §47', page: 103 }
      },
      {
        id: 'rows-assembly',
        title: { zh: '模型提议，受信任组件组装', en: 'Model proposal, trusted assembly' },
        purpose: { zh: '避免模型直接控制身份、权限、版本和收据等权威字段。', en: 'Prevent the model from directly controlling authoritative fields such as identity, permissions, versions, and receipts.' },
        input: { zh: '候选提议、授权能力、当前行快照以及已注册的编码和验证规则共同进入组装器。', en: 'A candidate proposal, authorization capability, current-row snapshot, and registered encoding and validation rules enter the assembler.' },
        process: { zh: '组装器验证身份、租户、权限、目标可行性和规范内容，并派生或验证神经表示。它检查保护策略与版本溢出，生成来源、回滚链和完整收据，最后对同一快照检查局部及全局不变量。', en: 'The assembler verifies identity, tenant, permissions, target feasibility, and canonical content, then derives or validates the neural representation. It checks protection rules and version overflow, creates provenance, rollback lineage, and a complete receipt, and finally checks local and global invariants against the same snapshot.' },
        output: { zh: '得到绑定快照前置条件的不可变完整行候选，或明确拒绝。', en: 'The result is an immutable complete-row candidate bound to a snapshot precondition, or an explicit rejection.' },
        boundary: { zh: '候选行的有效性取决于组装器所用的授权、验证规则和构建版本；用记录版本与测试样例核对这些依赖。', en: 'Candidate validity depends on the assembler’s authorization rules, validators, and build version; check these dependencies against recorded versions and test fixtures.' },
        reference: { label: 'v4 §36', page: 77 }
      },
      {
        id: 'rows-consistency',
        title: { zh: '规范内容与神经表示一致', en: 'Canonical and neural view consistency' },
        purpose: { zh: '防止可读内容与检索用神经表示各自指向不同事实。', en: 'Prevent readable content and its neural retrieval representation from referring to different facts.' },
        input: { zh: '完整候选行、声明的编码器或验证器配置、验证注册表和前一版本收据。', en: 'A complete candidate row, declared encoder or validator profile, validation registry, and predecessor receipt.' },
        process: { zh: '收据绑定规范字节、神经载荷、模式、验证配置和前序版本。受认证的提议配置可以支持一致性主张，但每种配置必须明确适用条件；不匹配时读取失败关闭并可将行隔离。', en: 'The receipt binds canonical bytes, neural payload, schema, validation profile, and predecessor version. Certified proposal profiles may support a consistency claim, but each profile must state its applicability conditions; mismatches fail closed on read and may quarantine the row.' },
        output: { zh: '得到带检查证据的双视图关系或明确的不一致结果。', en: 'The result is a dual-view relation with check evidence, or an explicit mismatch.' },
        boundary: { zh: '一致性结论适用于收据登记的模式、编码器/验证器版本及检查范围；读取时重算收据并核对双视图，内容是否符合外部事实另由来源和任务评估。', en: 'A consistency claim applies to the schema, encoder or validator versions, and checks named by the receipt; reads recompute the receipt and compare both views, while agreement with external facts is assessed through source and task evaluation.' },
        reference: { label: 'v4 §37', page: 79 }
      },
      {
        id: 'rows-event',
        title: { zh: '每个事件只提交一行或原样不变', en: 'One row or exact no-op per event' },
        purpose: { zh: '定义事件级原子性，避免一次操作悄悄混合多个事件或对象。', en: 'Define event-level atomicity and prevent one operation from silently combining events or objects.' },
        input: { zh: '一个已排序事件、事件开始时的权威快照和完整候选行。', en: 'One ordered event, its starting authoritative snapshot, and a complete candidate row.' },
        process: { zh: '组装器基于当前快照形成候选；事务控制器检查快照仍有效后，以比较并交换等方式原子发布整行。成功时恰有一行被替换；拒绝或冲突时，返回对目标行逐位相同的 NULL 结果。多事件段按顺序递归处理，每个事件读取前序已提交状态。', en: 'The assembler forms a candidate from the current snapshot; the transaction controller checks that the snapshot is still valid, then atomically publishes the whole row using compare-and-swap or an equivalent mechanism. Success replaces exactly one row; rejection or conflict returns a NULL result bit-identical to the target row. A multi-event segment recurses in order, with each event reading the state committed by earlier events.' },
        output: { zh: '每个事件得到一次完整行提交或一次可验证的原样不变结果。', en: 'Each event yields one complete-row commit or one verifiable bit-identical no-op.' },
        boundary: { zh: '该原子性以单个有序事件和一条目标行作为范围；整段或多对象的一致提交需另行定义事务，竞争提交须核对快照与全局约束。', en: 'This atomicity covers one ordered event and one target row; segment-wide or multi-object commits require a separately defined transaction, and competing commits must check snapshots and global constraints.' },
        reference: { label: 'v4 §38', page: 82 }
      },
      {
        id: 'rows-lifecycle',
        title: { zh: '生命周期与回滚', en: 'Lifecycle and rollback' },
        purpose: { zh: '为对象创建、更新、删除和恢复规定可审计的版本变化。', en: 'Specify auditable version changes for object creation, updates, deletion, and restoration.' },
        input: { zh: '操作类型、当前行、候选内容、保护策略和有界的同对象回滚历史。', en: 'An operation type, current row, proposed content, protection policy, and bounded same-object rollback history.' },
        process: { zh: '生命周期操作包括插入、更新、合并式更新、淘汰、别名改名、删除、访问控制或保护变更、隔离、修复和清除；删除先写入墓碑，满足保留条件后才可清除。回滚恢复旧内容但继续推进版本与来源链，并重新评估当前权限和保护条件。跨不同对象的双行合并不属于该单行契约。', en: 'Lifecycle operations include insertion, update, consolidating update, eviction, alias rename, deletion, access-control or protection changes, quarantine, repair, and purge; deletion first writes a tombstone, which may be purged only when retention conditions allow it. Rollback restores old content while advancing the version and provenance lineage, and rechecks current permissions and protection. A two-row merge across different objects is outside this single-row contract.' },
        output: { zh: '得到符合操作语义的新完整行，或符合条件的拒绝。', en: 'The result is a new complete row that follows the operation semantics, or a justified rejection.' },
        boundary: { zh: '回滚仅可使用保留环中的同对象快照，并沿用当前权限；历史到达容量上限或版本耗尽时，需按配置执行归档或命名空间迁移。', en: 'Rollback uses same-object snapshots retained in the ring and current permissions; when history reaches capacity or a version is exhausted, follow the configured archive or namespace-migration procedure.' },
        reference: { label: 'v4 §39', page: 84 }
      },
      {
        id: 'rows-integrity',
        title: { zh: '不变量、并发与访问隔离', en: 'Invariants, concurrency, and access isolation' },
        purpose: { zh: '说明合法状态如何在提交、并发和读取时保持有效。', en: 'Specify how valid state is preserved during commits, concurrency, and reads.' },
        input: { zh: '经过验证的前态、完整候选、租户分区、访问控制和当前索引提示。', en: 'A validated prior state, complete candidate, tenant partition, access controls, and current index hints.' },
        process: { zh: '证明在声明的假设下，合法前态经受约束的转移仍满足不变量；比较并交换用于确定并发提交的先后。索引按行派生，命中须核对租户、对象、槽序号、状态和收据；ACL、保护及删除状态由当前行约束。', en: 'Under stated assumptions, proofs show that constrained transitions preserve invariants from a valid prior state; compare-and-swap orders concurrent commits. Indexes are derived from rows, and hits must recheck tenant, object, slot sequence, status, and receipt; ACLs, protections, and deletion status are constrained by the current row.' },
        output: { zh: '得到依赖明确前提的状态保持、隔离和过期索引抑制结论。', en: 'The result is a state-preservation, isolation, and stale-index-suppression claim with explicit premises.' },
        boundary: { zh: '状态保持结论依赖相应的初态、授权、比较并交换、密码算法及固定分区等前提；实现核验应逐项提供前提收据，并覆盖并发与租户隔离用例。', en: 'Preservation claims rely on premises such as a valid initial state, authorization, compare-and-swap, cryptographic algorithms, and fixed partitions; implementation checks should supply evidence for each premise and cover concurrency and tenant-isolation cases.' },
        reference: { label: 'v4 §40–41', page: 87 }
      },
      {
        id: 'rows-recovery-cost',
        title: { zh: '崩溃恢复与完整成本账本', en: 'Crash recovery and complete cost ledger' },
        purpose: { zh: '把持久化发布顺序和资源成本纳入同一契约。', en: 'Include durable publication order and resource costs in the contract.' },
        input: { zh: '新行、审计绑定、表根、根选择器，以及索引、归档和写入的容量参数。', en: 'A new row, audit binding, table root, root selector, and capacity parameters for indexes, archives, and writes.' },
        process: { zh: '恢复协议先写入并验证新行、审计记录和新表根，再原子发布根选择器；崩溃后选取仍能完整验证的最新根，索引可在发布后更新或重建。成本账本分别统计驻留行、索引、候选、验证、发布、归档和审计开销。', en: 'The recovery protocol writes and verifies the new row, audit record, and table root before atomically publishing the root selector; after a crash, it selects the newest fully verifiable root, and indexes may be updated after publication or rebuilt. The cost ledger separately counts resident rows, indexes, candidates, validation, publication, archives, and audit overhead.' },
        output: { zh: '得到可恢复的根发布规则和逐项可复算的逻辑成本。', en: 'The result is a recoverable root-publication rule and an itemized, reproducible logical cost.' },
        boundary: { zh: '恢复保证以持久写入顺序、原子根选择器和审计绑定为前提；按协议注入崩溃并检查恢复根。v4 给出契约、条件性结论和实现核验项目。', en: 'Recovery guarantees depend on durable write ordering, an atomic root selector, and audit binding; inject crashes according to the protocol and check the recovered root. v4 specifies the contract, conditional results, and implementation checks.' },
        reference: { label: 'v4 §41–42, §44, §48', page: 90 }
      }
    ]
  },
  {
    id: 'admission',
    title: { zh: '预测式记忆准入', en: 'Predictive Memory Admission' },
    subtitle: { zh: '用分组未来和动作条件重放定义写入的预测风险', en: 'Define predictive write risk through grouped futures and action-conditioned replay' },
    lead: {
      zh: 'Predictive Memory Admission（PMA）研究一次记忆写入对后续任务的期望影响。这里的权威记忆指系统唯一采信、能决定当前记录内容的常驻状态。对每个可行动作，研究从同一状态快照出发，在多个有来源记录的未来分支上重放，并比较整段损失。v4 定义了期望风险决策、当前风险比较、未来盲值模型与保守选择规则，并给出依赖明确假设的理论结果和实证核验协议。',
      en: 'Predictive Memory Admission (PMA) studies the expected effect of a memory write on later tasks. Here, authoritative memory means the resident state the system alone trusts to determine current record contents. For each feasible action, the method replays from the same state snapshot across multiple provenance-tracked future branches and compares horizon loss. v4 defines expected-risk decisions, a current-risk comparison, a future-blind value model, and conservative selection rules, and gives theoretical results under stated assumptions together with empirical evaluation protocols.'
    },
    source: { file: 'https://github.com/MMLA-org/mmla-memory/raw/main/Predictive_Memory_Admission.pdf', label: 'Predictive Memory Admission / R02', page: 1 },
    sections: [
      {
        id: 'admission-state',
        title: { zh: '可部署信息与因果状态', en: 'Deployable information and causal state' },
        purpose: { zh: '明确决策时可见的信息，避免把未来结果泄漏给写入选择器。', en: 'Specify what is visible at decision time and prevent future outcomes from leaking into the admission selector.' },
        input: { zh: '已完成片段、当前权威记忆快照、因果历史、候选动作和决策时可见特征。', en: 'A completed segment, current authoritative memory snapshot, causal history, candidate actions, and features visible at decision time.' },
        process: { zh: '状态只包含决策时可部署的信息，并区分瞬时上下文和持久权威记忆。未来分支及其结局只用于离线教师评估，不能进入当时的选择器输入。', en: 'The state contains only information deployable at decision time and separates transient context from persistent authoritative memory. Future branches and their outcomes are for offline teacher evaluation and cannot enter the selector’s inputs at that time.' },
        output: { zh: '得到边界清楚的因果状态和决策信息集。', en: 'The result is a causal state and decision information set with a clear boundary.' },
        boundary: { zh: '部署输入限于事件发生时可见的信息；审计事件时间、快照摘要和来源链，确认训练特征均在该时点可取得。', en: 'Deployment inputs are limited to information visible at the event time; audit event timing, snapshot digests, and provenance to confirm every training feature was available then.' },
        reference: { label: 'v4 §51', page: 110 }
      },
      {
        id: 'admission-actions',
        title: { zh: '事件递归与完整动作集合', en: 'Event recursion and complete action set' },
        purpose: { zh: '让候选写入和拒绝写入在相同事件语义下可比较。', en: 'Make candidate writes and declining to write comparable under the same event semantics.' },
        input: { zh: '一个已排序事件、动作前状态、可行的完整写入候选及精确 NULL 动作。', en: 'One ordered event, pre-action state, complete feasible write candidates, and an exact NULL action.' },
        process: { zh: '每个候选动作从同一前态开始；该事件之后的事件读取此前已提交的分支状态。动作集合按事件定义，不能把多事件合成一次写入来获得不同的预测结果。教师可用精确枚举、冻结的后续策略或单事件干预定义未来处理方式。', en: 'Each candidate action starts from the same prior state; later events read the branch state committed earlier. The action set is defined per event, and multiple events cannot be combined into one write to obtain a different prediction. A teacher may define future handling by exact enumeration, a frozen continuation policy, or a single-event intervention.' },
        output: { zh: '得到逐事件、动作明确且带时间语义的比较问题。', en: 'The result is an event-by-event comparison with explicit actions and timing.' },
        boundary: { zh: '每个估计须标明采用的后续策略；比较不同策略所得价值时，应作为不同评估目标分别报告。', en: 'Label the continuation policy used for each estimate; values under different policies are separate evaluation targets and should be reported separately.' },
        reference: { label: 'v4 §52', page: 112 }
      },
      {
        id: 'admission-sequential',
        title: { zh: '多事件的序贯决策与后续动作', en: 'Sequential decisions across multiple events' },
        purpose: { zh: '在多个事件的未来风险中，避免预先固定所有后续写入，或事后偷看未来再选动作。', en: 'Avoid fixing all later writes in advance or choosing them after looking at the future when evaluating risk over multiple events.' },
        input: { zh: '当前事件前缀状态、完整候选动作、同前缀未来分支，以及每个后续事件的可行动作与损失。', en: 'The current event-prefix state, complete candidate actions, same-prefix future branches, and feasible actions and losses at each later event.' },
        process: { zh: '每个分支都从当前动作后的状态继续；后续事件须根据该分支此前已提交的状态重新生成候选并重新判断可行性。对初始动作的价值，先对未来分支求平均，再选择使平均后续损失最低的因果后续策略，即“先求期望、再取最小”；把最小值移入期望会变成看见每条未来后才选动作的预知策略。可分别用完整动态规划、预先冻结的未来盲后续策略，或关闭后续写入的单事件干预评估，三者不可混用。', en: 'Each branch continues from the state after the current action; at every later event, candidates are regenerated and feasibility is reassessed from that branch’s previously committed state. To value the initial action, average over future branches first, then choose the causal continuation policy with the lowest average future loss: “expectation first, then minimization.” Moving the minimum inside the expectation gives a clairvoyant policy that chooses after seeing each future. Evaluation may use exact dynamic programming, a preregistered future-blind rollout, or a single-event intervention that disables later writes; these protocols must not be mixed.' },
        output: { zh: '得到遵循事件顺序、针对初始动作计算的期望后续损失或成本。', en: 'The result is an expected continuation loss or cost for the initial action that respects event order.' },
        boundary: { zh: '动态规划中的后续动作只能依据分支当前前缀选择；冻结 rollout 则固定同一个未来盲策略，并按相应协议记录。', en: 'In dynamic programming, continuation actions may use only the branch’s current prefix; a frozen rollout uses the same future-blind policy and is recorded under its own protocol.' },
        reference: { label: 'v4 §52–54', page: 112 }
      },
      {
        id: 'admission-futures',
        title: { zh: '按前缀分组的未来分支', en: 'Future branches grouped by prefix' },
        purpose: { zh: '构造保留共同历史结构的未来样本并表达其目标分布。', en: 'Construct future samples that preserve shared history structure and state their target distribution.' },
        input: { zh: '具有完全相同决策前缀和写入前记忆快照的一组未来分支、来源信息、采样分布和目标分布。', en: 'A group of future branches with the exact same decision prefix and pre-write memory snapshot, plus provenance, a sampling distribution, and a target distribution.' },
        process: { zh: '组内所有未来分支必须共享完全相同的决策前缀和写入前记忆快照；不同组才代表不同前缀。事先登记分支来自真实重复采样、受控生成、模型生成还是观测日志，因为各自的风险估计假设不同。估计时记录分支权重和有效样本量；若采样未来与目标未来不同，须声明支持关系并处理权重或分布偏差。训练、校准与最终评估按完整前缀组隔离。', en: 'All future branches within a group must share the exact same decision prefix and pre-write memory snapshot; different groups represent different prefixes. Register in advance whether branches come from repeated real sampling, a controlled generator, a model-generated process, or observational logs, since each entails different risk-estimation assumptions. Record branch weights and effective sample size; if sampled futures differ from target futures, state the support conditions and address weighting or distribution bias. Keep each complete prefix group together across training, calibration, and final evaluation.' },
        output: { zh: '得到带采样假设和隔离规则的未来分支组。', en: 'The result is a set of future-branch groups with sampling assumptions and isolation rules.' },
        boundary: { zh: '风险估计适用于登记的采样设计和有支持的目标动作；核对权重、有效样本量及采样到目标分布的桥接，必要时报告风险区间。', en: 'Risk estimates apply to the registered sampling design and target actions with support; check weights, effective sample size, and the bridge from sampling to target distribution, and report risk bounds when needed.' },
        reference: { label: 'v4 §53', page: 114 }
      },
      {
        id: 'admission-replay',
        title: { zh: '动作条件重放与多事件损失', en: 'Action-conditioned replay and horizon loss' },
        purpose: { zh: '对每个可行动作计算可比较的未来任务结果。', en: 'Compute comparable future task outcomes for every feasible action.' },
        input: { zh: '一个不可变动作前快照、每个可行动作和每个分支的事件序列。', en: 'One immutable pre-action snapshot, each feasible action, and each branch’s event sequence.' },
        process: { zh: '每个动作与未来分支组合都恢复同一快照，再执行动作并重放注册时间范围内的所有事件。损失可包含任务错误、过时信息泄漏、对无关记忆的旁损、写入内容污染、安全影响及时间、流量等资源成本；各项权重与计算规则须事先固定。保留动作间配对差异，并记录重放完整性和资源成本。', en: 'Each action and future-branch pair restores the same snapshot, applies the action, and replays all events over the registered horizon. Loss may include task error, stale-information leakage, collateral damage to unrelated memory, write contamination, security impact, and resource costs such as time and traffic; weights and measurement rules must be fixed in advance. Paired action differences, replay integrity, and resource costs are recorded.' },
        output: { zh: '得到各动作在各未来分支上的配对损失数据。', en: 'The result is paired loss data for each action on each future branch.' },
        boundary: { zh: '跨动作比较应使用相同快照、损失定义、时间范围和后续策略；验证记录须覆盖每个动作与未来分支组合。', en: 'Compare actions using the same snapshot, loss definition, horizon, and continuation policy; the replay record should cover every action and future-branch pair.' },
        reference: { label: 'v4 §54', page: 116 }
      },
      {
        id: 'admission-oracle',
        title: { zh: '期望风险预言机与当前风险基线', en: 'Expected-risk oracle and current-risk baseline' },
        purpose: { zh: '定义评估上限，并区分未来价值与眼前风险。', en: 'Define an evaluation ceiling and distinguish future value from immediate risk.' },
        input: { zh: '已定义的动作条件分支损失、目标未来分布、NULL 动作和当前风险指标。', en: 'Action-conditioned branch losses, target future distribution, the NULL action, and a current-risk measure.' },
        process: { zh: '期望风险预言机选择目标未来分布下平均损失最低的可行动作，包含 NULL。当前风险比较器只衡量当前任务上的损失，两者回答不同问题；预言机差距需在新前缀组上估计，并达到事先规定的最低有效差距。', en: 'The expected-risk oracle selects the feasible action with lowest mean loss under the target future distribution, including NULL. A current-risk comparator measures current-task loss only, so the two answer different questions; the oracle gap must be estimated on fresh prefix groups and exceed a preregistered minimum meaningful margin.' },
        output: { zh: '得到理想期望风险动作、当前风险参照及其差距估计。', en: 'The result is an ideal expected-risk action, a current-risk reference, and an estimate of their gap.' },
        boundary: { zh: '预言机用于离线比较目标分布下的期望风险，因使用未来结果而不是部署策略；其差距按新前缀组估计，再与当前风险比较器和预先规定的有效差距门槛对照。', en: 'The oracle compares expected risk under the target distribution offline and is not a deployable policy because it uses future outcomes; estimate its gap on fresh prefix groups and compare it with the current-risk comparator and a preregistered meaningful-gap threshold.' },
        reference: { label: 'v4 §55', page: 118 }
      },
      {
        id: 'admission-uncertainty',
        title: { zh: '同时不确定区间与保守选择', en: 'Simultaneous uncertainty intervals and conservative choice' },
        purpose: { zh: '将多动作选择带来的统计不确定性纳入写入决策。', en: 'Account for statistical uncertainty from choosing among multiple write actions.' },
        input: { zh: '所有可行动作的风险估计、预先定义的同时置信族和独立校准数据。', en: 'Risk estimates for every feasible action, a prespecified simultaneous confidence family, and separate calibration data.' },
        process: { zh: '区间须对整个动作集合及登记的种子、前缀组和主要子组同时覆盖，而不只是逐动作边际覆盖。保守规则根据风险上界选择可行写入，并将 NULL 纳入单独校准的比较；不确定性不足以支持写入时可以弃权。', en: 'Intervals must cover the full action set and registered seeds, prefix groups, and primary subgroups simultaneously, not only marginally for each action. A conservative rule selects a feasible write using risk upper bounds and compares it with NULL under a separately calibrated rule; it may abstain when uncertainty does not support a write.' },
        output: { zh: '得到考虑选择效应、NULL 和弃权行为的保守候选动作。', en: 'The result is a conservative candidate action that accounts for selection, NULL, and abstention.' },
        boundary: { zh: '区间覆盖声明针对预先登记的完整动作与子组集合；在独立保留的前缀组上按同一同时推断和 NULL 校准规则评估。', en: 'Interval-coverage claims apply to the complete preregistered action and subgroup family; evaluate them on independent held-out prefix groups using the same simultaneous-inference and NULL-calibration rules.' },
        reference: { label: 'v4 §56', page: 120 }
      },
      {
        id: 'admission-identification',
        title: { zh: '目标风险何时可识别', en: 'When target risk is identifiable' },
        purpose: { zh: '说明何时分支重放能够代表部署时关心的未来。', en: 'State when branch replay can represent the futures relevant at deployment.' },
        input: { zh: '采样分布与目标分布、分支支持范围、分布偏移界限和评估器假设。', en: 'Sampling and target distributions, branch support, distribution-shift bounds, and evaluator assumptions.' },
        process: { zh: '完整分组重放可在其假设下识别相应目标风险；采样与目标未来的概率分布一致、支持有效的重加权或有保证的偏移范围可构成桥接。缺乏支持、分支分布改变、评估器失配或未来泄漏时，风险只能给界或无法识别。', en: 'Complete grouped replay identifies the corresponding target risk under its assumptions; a bridge may use equality between sampling and target probability distributions, support-valid reweighting, or a guaranteed shift set. With missing support, changed branch distributions, evaluator misspecification, or future leakage, risk may only be bounded or may be unidentified.' },
        output: { zh: '得到目标风险可识别、部分可界定或不可识别的判定。', en: 'The result states whether target risk is identified, partially bounded, or unidentified.' },
        boundary: { zh: '点风险估计适用于有支持且与目标分布有登记桥接的未来；对支持范围外或桥接假设不充分的部分，改报识别区间并做敏感性分析。', en: 'Point-risk estimates apply to supported futures with a registered bridge to the target distribution; for unsupported regions or insufficient bridge assumptions, report identification bounds and sensitivity analyses.' },
        reference: { label: 'v4 §57', page: 122 }
      },
      {
        id: 'admission-value',
        title: { zh: '未来盲值模型与因果训练', en: 'Future-blind value model and causal training' },
        purpose: { zh: '把离线教师评估转化为部署时可用的动作估值。', en: 'Turn offline teacher evaluations into action values usable at deployment.' },
        input: { zh: '只含决策时特征的训练输入、动作条件教师目标和按前缀组隔离的数据划分。', en: 'Training inputs with decision-time features only, action-conditioned teacher targets, and data splits isolated by prefix group.' },
        process: { zh: '模型学习在决策信息集下预测各动作的未来目标损失或价值，而不接触未来分支特征。训练、校准和最终评估使用隔离前缀组，并按种子和主要子组检查校准、排序、NULL 行为及完整动作集合上的遗憾。', en: 'The model learns to predict future target loss or value for each action from the decision-time information set, without access to future-branch features. Training, calibration, and final evaluation use isolated prefix groups and check calibration, ranking, NULL behavior, and regret over the complete action set across seeds and primary subgroups.' },
        output: { zh: '得到一个未来不可见、带评估记录的部署值模型。', en: 'The result is a future-blind deployment value model with an evaluation record.' },
        boundary: { zh: '部署时只向值模型提供决策信息集内的特征；在隔离前缀组上评估校准、动作排序、NULL 选择与各子组遗憾。', en: 'At deployment, provide only features in the decision information set; assess calibration, action ranking, NULL selection, and subgroup regret on isolated prefix groups.' },
        reference: { label: 'v4 §58–59', page: 124 }
      },
      {
        id: 'admission-cost-stop',
        title: { zh: '成本、分布外停止与资格门槛', en: 'Costs, out-of-distribution stops, and qualification gates' },
        purpose: { zh: '明确选择器的适用范围、资源开销和逐步核验条件。', en: 'Specify the selector’s scope, resource costs, and staged verification conditions.' },
        input: { zh: '完整教师与部署成本、支持和泄漏审计、风险区间、校准结果及预注册停止规则。', en: 'Complete teacher and deployment costs, support and leakage audits, risk intervals, calibration results, and preregistered stop rules.' },
        process: { zh: '成本账本计入候选生成、每动作每分支重放、评估器和存储等逻辑工作，并单列部署成本。资格流程逐阶段审查目标支持、区间精度、NULL 对照、子组稳定性和审计记录；任一项触发预注册停止规则时暂停后续阶段，满足各阶段条件后再评估重复写入。', en: 'The cost ledger counts logical work for candidate generation, replay per action and branch, evaluators, and storage, and reports deployment cost separately. The qualification protocol checks target support, interval precision, NULL comparisons, subgroup stability, and audit records at each stage; a preregistered stop rule pauses progression when triggered, and repeated writes are evaluated after the staged conditions are met.' },
        output: { zh: '得到含停止条件的资格判定和完整成本报告。', en: 'The result is a qualification decision with stop conditions and a complete cost report.' },
        boundary: { zh: 'v4 给出条件性理论结果和分阶段评估协议；报告部署结论时，应列出各阶段的样本、费用、区间、NULL 对照与停止规则结果。', en: 'v4 gives theoretical results under stated assumptions and a staged evaluation protocol; deployment reports should list each stage’s samples, costs, intervals, NULL comparisons, and stop-rule outcomes.' },
        reference: { label: 'v4 §60–62', page: 127 }
      }
    ]
  }
);
