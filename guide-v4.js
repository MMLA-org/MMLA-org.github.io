window.MMLA_GUIDE_PARTS = window.MMLA_GUIDE_PARTS || [];
window.MMLA_GUIDE_PARTS.push({
  id: 'v4',
  title: { zh: 'MMLAv4：总体架构', en: 'MMLAv4: The Integrated Architecture' },
  subtitle: { zh: '综合报告机制导览', en: 'A guide to the integrated report' },
  lead: {
    zh: 'MMLA 用两种状态承接推理中获得的信息。数值策略状态 Φ 根据反馈调整后续生成，记忆表 M 保存片段结束后筛选出的记录。v4 统一规定它们的更新、读取和协作方式，并展开记忆检索、关系绑定与潜在表示读出等组件。',
    en: 'MMLA uses two states to carry information gained during reasoning. Numerical policy state Φ adapts later generation from feedback; memory table M retains selected records after segments close. v4 defines how they update, read, and work together, alongside retrieval, relational binding, and latent readout components.'
  },
  source: { file: 'https://github.com/MMLA-org/mmla-memory/raw/main/2606.28876v4.pdf', label: 'MMLAv4', page: 7 },
  sections: [
    {
      id: 'v4-five-states',
      title: { zh: '五类状态，各有职责', en: 'Five states with distinct roles' },
      purpose: { zh: '先弄清什么在变化、谁有权改变它，以及它能持续多久。', en: 'Identify what changes, who may change it, and how long it lasts.' },
      input: { zh: '输入是一段因果生成中的 token 流，以及此前已经形成的状态。', en: 'The input is a causally generated token stream and the states already formed.' },
      process: { zh: 'v4 区分 token 级因果状态 h、已完成片段工作区 B、数值策略载体 Φ、有界权威记忆 M 和较慢更新的基础参数 θ。模型可在声明的接口中读取多个状态，但每类状态有自己的写入者、生命周期和恢复域。', en: 'V4 distinguishes token-level causal state h, completed-segment workspace B, numerical policy carrier Φ, bounded authoritative memory M, and slower base parameters θ. A model may read several states through declared interfaces, but each has its own writer, lifetime, and recovery domain.' },
      output: { zh: '一次推理使用兼容的状态视图，并保留各状态独立的身份和边界。', en: 'A reasoning attempt uses compatible state views while preserving each state’s separate identity and boundary.' },
      boundary: { zh: '架构有五层状态；“双状态”专指 Φ 与 M 两种适应载体，不包括 θ。共享读取不代表共享写入权。', en: 'The architecture has five state layers; “dual state” refers to the two adaptation carriers Φ and M, not θ. Shared reads do not grant shared write authority.' },
      reference: { label: 'v4 §§2.1, 3.1', page: 9 }
    },
    {
      id: 'v4-two-update-paths',
      title: { zh: '两条更新路径', en: 'Two update paths' },
      purpose: { zh: '区分问题仍在进行时的策略调整和片段关闭后的记忆整合。', en: 'Separate policy adaptation during a problem from memory consolidation after a segment closes.' },
      input: { zh: '策略路径接收已经到达的反馈；记忆路径接收已经完成并获得事件身份的观察。', en: 'The policy path receives feedback that has arrived; the memory path receives completed observations with event identities.' },
      process: { zh: '在问题解决或放弃之前，反馈可触发 Φ 的有界更新，也可被精确拒绝而保持不变。记忆路径只处理已完成的观察，按顺序提出并决定记忆动作。θ 在这些推理时更新中保持固定；后续尝试读取更新后兼容的状态。一个可选的联合控制目标会把策略动作与记忆动作作为配对选择，按后续任务风险、记忆损害和计算成本评估。', en: 'Before a problem is resolved or abandoned, feedback may trigger a bounded update to Φ or be rejected with no change. The memory path handles only completed observations and processes their memory actions in order. θ stays fixed during these reasoning-time updates; later attempts read the resulting compatible states. An optional joint-control objective treats policy and memory actions as a pair and evaluates later task risk, memory harm, and computation cost.' },
      output: { zh: '策略更新产生新的 Φ 或精确不变结果；记忆路径产生完整行提交或精确 NULL。', en: 'The policy path produces a new Φ or an exact no-op; the memory path produces a complete-row commit or exact NULL.' },
      boundary: { zh: '基础架构允许两种状态各自授权更新；配对控制是可选配置。离线训练一个适配器后冻结评估，不等于同一未结束问题内的策略更新与再使用。', en: 'The base architecture permits separately authorized updates; paired control is optional. Training an adapter offline and freezing it for evaluation is not an update-and-reuse witness within one unresolved problem.' },
      reference: { label: 'v4 §§2.2–2.3', page: 8 }
    },
    {
      id: 'v4-paired-action-objective',
      title: { zh: '可选的配对动作目标', en: 'Optional paired-action objective' },
      purpose: { zh: '说明策略更新和记忆写入若联合决策，目标与控制边界是什么。', en: 'Define the objective and control boundary when policy and memory actions are selected together.' },
      input: { zh: '输入是一个决策前可见的因果历史、策略状态、记忆状态及两类状态各自可行的动作。', en: 'The input is decision-time causal history, policy and memory state, and the feasible actions for each state.' },
      process: { zh: '可选的联合配置把动作写成一对：Φ 的有界更新或不更新，以及 M 的完整行写入或 NULL。目标最小化条件期望任务损失与记忆损害，再计入策略反向传播、优化器和恢复检查、候选构造、完整行组装与校验、动作重放、提交、归档、索引、读取、延迟、内存和能耗。选择器可以先估计策略动作、再按该动作估计记忆动作，但这种分解不消除交互作用或配对成本。', en: 'The optional joint profile forms a pair: a bounded Φ update or no update, and a complete-row M write or NULL. Its objective minimizes conditional expected task loss and memory harm, then accounts for policy backpropagation, optimizer and reset checks, candidate construction, complete-row assembly and validation, action replay, commit, archive, indexing, reads, latency, memory, and energy. A selector may estimate policy actions first and memory actions conditional on them, but this factorization does not remove interaction effects or paired costs.' },
      output: { zh: '目标是从决策时可见的信息中选取后果较低的动作对，并保留两条独立收据。', en: 'The goal is to choose a lower-consequence action pair from decision-time information while retaining separate receipts for both state paths.' },
      boundary: { zh: '联合控制是可选决策形式；无论是否因子分解估计，两类状态仍保留各自的写入权限、版本和恢复域。', en: 'Joint control is an optional decision form; whether or not its estimates are factorized, the two states retain separate write authority, versions, and recovery domains.' },
      reference: { label: 'v4 §2.2', page: 8 }
    },
    {
      id: 'v4-completed-segment',
      title: { zh: '片段完成后再回看', en: 'Review only after a segment closes' },
      purpose: { zh: '允许整合已经观察到的片段，同时保护此前已经生成的输出。', en: 'Consolidate an observed segment without changing output already generated.' },
      input: { zh: '输入是片段边界之前可见的历史、先前记忆和已完整到达的片段。', en: 'The input is history visible before the segment boundary, prior memory, and a fully arrived segment.' },
      process: { zh: '局部双向整合器可在片段关闭后重新解释其中的内容，并将其拆成有界、有序事件。它可同时利用片段内已到达的左右文，但不能读取片段结束后的 token。新记忆状态只对边界之后的推理可用。', en: 'After a segment closes, a local bidirectional consolidator may reinterpret its content and split it into a bounded ordered event list. It may use both sides of the completed segment, but cannot read tokens after the segment boundary. The new memory state is available only to reasoning after that boundary.' },
      output: { zh: '输出是按顺序待处理的已完成事件及其片段工作区。', en: 'The output is a completed-segment workspace and an ordered list of events to process.' },
      boundary: { zh: '“双向”指回看完整片段，不指双向生成或偷看未来。片段内整合是否改善表现仍需与等算力因果编码比较。', en: '“Bidirectional” means reviewing a completed segment, not generating bidirectionally or seeing the future. Any benefit must still be compared with equal-compute causal encoding.' },
      reference: { label: 'v4 §3.2', page: 11 }
    },
    {
      id: 'v4-atomic-memory-row',
      title: { zh: '候选行与原子提交', en: 'Candidate rows and atomic commits' },
      purpose: { zh: '让可读内容、检索表示和权威元数据保持成一条可校验记录。', en: 'Keep readable content, retrieval representations, and authoritative metadata in one verifiable record.' },
      input: { zh: '输入是一个已完成事件、写入前的记忆快照，以及每个可行目标槽位对应的候选。', en: 'The input is a completed event, the pre-write memory snapshot, and candidates conditioned on feasible target slots.' },
      process: { zh: '神经构造器针对目标提出有界规范内容、别名、神经载荷、类型化路由键、不确定性和操作意图。可信组装器补入系统拥有的身份、租户与权限、继承保护、下一版本、来源收据及回滚谱系，再执行字段、容量、安全和一致性检查。', en: 'A neural constructor proposes bounded canonical content, aliases, neural payload, typed routing key, uncertainty, and operation intent for a target. A trusted assembler adds system-owned identity, tenant and permissions, inherited protection, next version, provenance receipt, and rollback lineage, then checks schema, capacity, security, and consistency.' },
      output: { zh: '每个事件最多原子提交一条完整行，或选择不改变权威状态的 NULL。', en: 'Each event atomically commits at most one complete row, or chooses NULL and leaves authoritative state unchanged.' },
      boundary: { zh: '可信校验通过不证明内容为真或语义读出有效。NULL 不是删除；删除以带版本的 tombstone 表示，长来源与回滚文档在 resident row 外另行计费。', en: 'Passing trusted validation does not prove that content is true or that semantic readout works. NULL is not deletion; deletion uses a versioned tombstone, and long provenance or rollback documents live outside the resident row and are charged separately.' },
      reference: { label: 'v4 §3.3', page: 11 }
    },
    {
      id: 'v4-predictive-admission',
      title: { zh: '以未来风险为目标的准入', en: 'Admission based on future risk' },
      purpose: { zh: '在容量有限时，比较写入、覆盖与不写入会怎样影响后续任务。', en: 'With limited capacity, compare how writing, overwriting, or abstaining affects later tasks.' },
      input: { zh: '对每个决策时刻，输入包括相同的因果历史、写入前记忆、可行候选动作及一组同前缀未来。', en: 'For each decision point, the inputs are the same causal history, pre-write memory, feasible candidate actions, and grouped futures sharing that prefix.' },
      process: { zh: '离线训练评估器从同一个不可变快照分别执行各槽位写入和 NULL，并在每条未来分支上重放后续计算，汇总任务误差、旧记忆损害及动作成本。目标是条件期望风险，而不是挑选某一条未来分支偏好的动作。通过先决验证后，决策时看不到未来结果的价值模型才可学习从当时可见的信息预测各动作风险。', en: 'An offline training evaluator applies each slot write and NULL separately from one immutable snapshot, then replays later computation on each future branch and aggregates task error, damage to retained memory, and action cost. The target is conditional expected risk, not the action preferred by one particular future branch. Only after prerequisite evidence passes may a value model that cannot see future outcomes learn to predict action risks from information available at decision time.' },
      output: { zh: '部署时，选择器估计可行动作和 NULL 的条件风险，再选择较低风险动作，或在不确定时不写入。', en: 'At deployment, a selector estimates conditional risk for feasible actions and NULL, then chooses a lower-risk action or abstains when uncertain.' },
      boundary: { zh: '未来分支和训练评估器状态只用于产生训练目标，答案与事后评估不得进入部署决策输入。该机制依赖可用的因果历史摘要、有效候选和校准的风险估计。', en: 'Future branches and training-evaluator states are used only to produce training targets; answers and post-boundary evaluations must not enter deployment inputs. The mechanism depends on a usable causal history summary, valid candidates, and calibrated risk estimates.' },
      reference: { label: 'v4 §3.4', page: 14 }
    },
    {
      id: 'v4-predictive-information-motivation',
      title: { zh: '预测信息与记忆压缩', en: 'Predictive information and memory compression' },
      purpose: { zh: '说明有限记忆为何应保留对未来有用的信息，而不是复制全部过去。', en: 'Explain why bounded memory should preserve information useful for the future instead of copying the entire past.' },
      input: { zh: '输入概念上是过去、有限记忆状态与未来观察之间的统计关系。', en: 'Conceptually, the input is the statistical relationship among the past, bounded memory, and future observations.' },
      process: { zh: '信息瓶颈动机把记忆看成过去的有损编码，希望它压缩历史，同时保留预测未来所需的信息。报告用此原则解释条件风险目标和容量约束。它不是上线准入器的具体算法；具体动作仍需候选重放、价值估计、校准和审计。', en: 'The information-bottleneck motivation treats memory as a lossy code of the past: compress history while retaining information useful for predicting the future. The report uses this principle to motivate conditional risk and capacity constraints. It is not the deployed admission algorithm; concrete actions still require candidate replay, value estimation, calibration, and audit.' },
      output: { zh: '输出是一个设计动机：优先压缩过去中对未来决策有用的部分。', en: 'The output is a design motivation: compress the past while preserving what helps future decisions.' },
      boundary: { zh: '有限存储不能创造预测信息；信息论目标本身不证明任何系统学得了有用记忆，也不证明节能。', en: 'Finite storage cannot create predictive information; the information-theoretic objective alone proves neither useful learned memory nor energy savings.' },
      reference: { label: 'v4 §3.5', page: 15 }
    },
    {
      id: 'v4-bounded-state-fallback',
      title: { zh: '有界驻留记忆与回退检索', en: 'Bounded resident memory and fallback retrieval' },
      purpose: { zh: '面对写入时无法知道未来相关性的事实，允许系统在查询时承认遗漏并回退。', en: 'When future relevance is unknown at write time, let the system recognize a miss at query time and fall back.' },
      input: { zh: '写入阶段输入查询无关的上下文单元；查询阶段才获得用户问题和驻留证据。', en: 'The write stage sees query-independent context units; the query stage later receives the question and resident evidence.' },
      process: { zh: '受控生命周期路径先由不看问题的写入器识别更新、提及、拒绝、锁定和别名定义，再按事件处理：更新替换同键值，锁定保护记录，拒绝与提及不写入，容量不足时驱逐未保护且最久未更新的槽位。多跳问答路径把驻留段落作为有界缓存；查询到达后，重排序器用稠密、BM25、词汇重合和桥接特征选证据，置信度低或未命中时回退到完整上下文的稀疏检索。', en: 'The controlled lifecycle path first uses a query-blind writer to identify update, mention, reject, lock, and alias-definition events, then processes them: updates replace same-key values, locks protect records, rejects and mentions do not write, and capacity pressure evicts the least-recently-updated unprotected slot. The multi-hop QA path uses resident passages as a bounded cache; after the query arrives, a reranker selects evidence using dense, BM25, lexical-overlap, and bridge features, with sparse retrieval over the full context as fallback on a miss or low confidence.' },
      output: { zh: '系统输出驻留证据，或在未命中、置信度不足时回退到原上下文检索。', en: 'The system returns resident evidence or falls back to retrieval over the source context on a miss or low confidence.' },
      boundary: { zh: '驻留槽位有界不等于总存储有界；归档存储、索引、延迟与能耗要单独核算。阈值在错误长度上校准会使回退失效。', en: 'Bounded resident slots do not bound total storage; archive, indexes, latency, and energy must be counted separately. A threshold calibrated at the wrong context length can disable useful fallback.' },
      reference: { label: 'v4 §3.6', page: 16 }
    },
    {
      id: 'v4-component-evidence',
      title: { zh: '受控生命周期与问答检索证据', en: 'Evidence from controlled lifecycle and QA retrieval' },
      purpose: { zh: '说明哪些子机制已在受限任务中接受测试。', en: 'Show which component mechanisms have been tested in restricted settings.' },
      input: { zh: '实验分别使用受控版本事件、容量压力案例和留出的多跳问答段落。', en: 'The studies use controlled versioning events, capacity-pressure cases, and held-out multi-hop QA passages.' },
      process: { zh: '受控语言生命周期研究把类型事件转成写入、保护、陈旧值拒绝、驱逐或不写入动作，并验证容量和读回行为；完整路径在每个固定种子的 300 条留出记录上达到 1.000 exact match。问答研究在自然长度与扩展长度语料上，用按目标长度校准的驻留缓存与归档回退选择证据，报告其相对稠密检索、BM25 和全文读取的质量与输入 token 成本。', en: 'The controlled-language lifecycle study maps typed events to writes, protection, stale-value rejection, eviction, or no-write actions and checks capacity and readback; the complete path reached 1.000 exact match on 300 held-out records for each fixed seed. The QA study uses a resident cache with archive fallback, calibrated at the target context length, to select evidence on natural- and extended-length corpora, reporting quality and input-token cost against dense retrieval, BM25, and full-context reading.' },
      output: { zh: '结果支持特定受控生命周期执行和特定问答检索路径。', en: 'The results support a specific controlled lifecycle executor and a specific QA retrieval path.' },
      boundary: { zh: '生命周期事件使用受控语言线索；QA 语料是静态段落缓存，未触发同键覆盖与保护。两者测试的是不同子机制，不能合并成一个端到端系统效果。', en: 'Lifecycle events use controlled-language cues; the QA corpus is a static passage cache and does not exercise same-key overwrite or protection. The studies test different components and should not be combined into one end-to-end system effect.' },
      reference: { label: 'v4 §§4–7', page: 17 }
    },
    {
      id: 'v4-anchor-filler-transport',
      title: { zh: '锚点与填充值的关系绑定', en: 'Anchor–filler relational binding' },
      purpose: { zh: '在受控编译任务中检验语义角色锚点如何把关系连接到正确的内容填充值。', en: 'Test how semantic role anchors connect relations to the correct content fillers in a controlled compiler task.' },
      input: { zh: '输入为事件、查询、关系类型和候选填充项；原始推理接口不接收标准答案片段、锚点、角色或对齐标签。', en: 'Inputs are events, a query, relation types, and candidate fillers; the raw inference interface receives no gold spans, anchors, roles, or alignment labels.' },
      process: { zh: '锚点-填充值关系传输（AFRT）先预测某个角色指向哪个语义锚点，再沿带类型的关系路径把锚点概率传到填充项；传输依赖关系类型，不读取填充项内容，正反方向与重复路径步数共享参数。随后由动态部分 Sinkhorn 分配器约束角色与填充值：每个角色分配总质量为 1，可把质量放在自己的 NULL；每个真实填充项最多分给一个角色。', en: 'Anchor–filler relational transport (AFRT) first predicts which semantic anchor a role refers to, then transports anchor probability to fillers along typed relation paths; transport depends on relation type, not filler content, and shares parameters across directions and repeated path steps. A dynamic partial Sinkhorn assignment then constrains roles and fillers: each role assigns total mass 1 and may assign it to its own NULL; each real filler can serve at most one role.' },
      output: { zh: '在三组固定种子的受控留出集上，typed AFRT 每组 240/240 全记录精确成功，三个对照均为 0/240。', en: 'On the controlled held-out sets, typed AFRT achieved 240/240 whole-record exactness for each of three fixed seeds; all three controls scored 0/240.' },
      boundary: { zh: '这是合成关系拓扑中的窄结果，不证明自然语言关系发现、通用图推理或完整语言模型收益；该比较也不能单独归因于锚点和传输的分解结构。', en: 'This is a narrow result on synthetic relation topologies; it does not establish natural-language relation discovery, general graph reasoning, or gains in a full language model. The comparison also does not isolate factorization as the sole cause.' },
      reference: { label: 'v4 §8', page: 22 }
    },
    {
      id: 'v4-semantic-interface-qualification',
      title: { zh: '先验证记忆读出接口', en: 'Qualify the memory read interface first' },
      purpose: { zh: '检验结构上正确的记忆行是否能被模型语义读取和使用。', en: 'Test whether structurally correct memory rows can be read and used semantically by a model.' },
      input: { zh: '输入包括固定检查点、行记录、查询和已登记的候选重建及问答标准。', en: 'Inputs include a frozen checkpoint, row records, queries, and registered candidate-reconstruction and QA criteria.' },
      process: { zh: '资格流程比较外部语义适配器、原始表示探针，以及稠密行、结构化片段和模型原生读者。它分别核对候选内容重建、查询答案、缺失值处理、校准、无关事实保持、旧值抑制和结构映射；拟合集诊断及标准答案路由对照用于区分路由与内容读出。', en: 'The qualification procedure compares an external semantic adapter, a raw-representation probe, and dense-row, structured-span, and checkpoint-native readers. It separately checks candidate reconstruction, query answers, missing-value handling, calibration, preservation of unrelated facts, old-value suppression, and structural mapping; fit-support diagnostics and oracle routing controls distinguish routing from content readout.' },
      output: { zh: '输出是一组分开的结构与语义资格检查，并记录每个固定检查点和接口对应的读出能力。', en: 'The output is a set of separate structural and semantic qualification checks that records readout behavior for each fixed checkpoint and interface.' },
      boundary: { zh: '结论适用于登记的检查点、接口、训练预算和评估任务；标准答案路由只用于诊断，不代表可部署的学得路由。', en: 'Conclusions apply to the registered checkpoints, interfaces, training budgets, and evaluation tasks; oracle routing is diagnostic and is not a deployable learned router.' },
      reference: { label: 'v4 §§9–11', page: 25 }
    },
    {
      id: 'v4-posttraining-readout',
      title: { zh: '受限后训练读出与生成', en: 'Restricted post-training readout and generation' },
      purpose: { zh: '在另一模型与训练谱系中，分开衡量绑定响应、候选排序和自由生成。', en: 'In a separate model and training lineage, measure binding response, candidate ranking, and free generation separately.' },
      input: { zh: '输入是固定模型、受控记忆行、查询和答案候选；后续压力测试还包含连续事件与新词。', en: 'Inputs are a fixed model, controlled memory rows, queries, and answer candidates; later stress tests also include continuous events and new words.' },
      process: { zh: '小型低秩适配器把行内容读成供模型使用的潜在表示；读出测试分开检查给定候选答案是否跟随新绑定，以及模型不受候选约束时能否自由生成。连续事件条件在 32 个已完成事件中插入 8 次查询，使用外部规则写入器和标准答案行选择，检查多次读取、状态更新及同状态恢复。', en: 'Small low-rank adapters turn row content into a latent representation for the model; readout tests separately ask whether a supplied answer candidate follows a new binding and whether the model can generate freely without candidate constraints. The continuous-event condition places eight queries among 32 completed events, uses an external rule writer and oracle row selection, and checks repeated reads, state updates, and restoration of the same state.' },
      output: { zh: '报告分别记录候选跟随、自由生成、绑定更新、无关行保持和恢复；这些端点回答的是不同问题。', en: 'The report records candidate following, free generation, binding updates, preservation of unrelated rows, and restoration separately; these endpoints answer different questions.' },
      boundary: { zh: '这是受控行、有限词表、外部写入和标准答案路由下的读出研究；适配器离线训练后冻结，不能当作问题内 Φ 更新的证据。', en: 'This is a readout study with controlled rows, finite vocabularies, external writing, and oracle routing; adapters are trained offline and frozen, so the study is not evidence of within-problem Φ updates.' },
      reference: { label: 'v4 §12', page: 26 }
    },
    {
      id: 'v4-coverage-bridge-teacher',
      title: { zh: '覆盖控制的潜在读出比较', en: 'Coverage-controlled latent readout comparison' },
      purpose: { zh: '比较桥接映射与文本模型对齐分别怎样影响连续事件中的潜在表示读出。', en: 'Compare how a bridge map and text-model alignment affect latent readout on continuous-event tasks.' },
      input: { zh: '三组使用同一固定模型谱系、记忆行、查询和完整覆盖标签；学生读取独立冻结编码器产生的上下文表示，不读取原始记忆词元嵌入。', en: 'All three arms use the same fixed model lineage, memory rows, queries, and covered labels; the student reads contextual states from an independent frozen encoder, not the original memory-token embeddings.' },
      process: { zh: '三组共享固定非零 BOS 锚点和记忆跨度：A 使用归一化上下文表示与学习到的值残差；B、C 再加一个零初始化的全宽线性桥接映射。三组都对绑定改变的查询和独立未改变查询做正例交叉熵，并用正确/错配条件的损失差加 hinge 项；B 与 A 的差异检验桥接映射。C 再以冻结文本模型在每个正例答案词元位置（首词元和后续词元都包括）的全词表分布加入 KL 对齐损失；C 与 B 的差异检验这项对齐目标。', en: 'All three arms share a fixed nonzero BOS anchor and memory span: A uses normalized contextual states plus a learned value residual; B and C add a zero-initialized full-width linear bridge map. All three use positive answer cross-entropy for changed-binding and independent unchanged-key queries, plus a hinge term on the loss gap between correct and mismatched conditions; B versus A tests the bridge. C also adds a KL alignment loss to the frozen text model’s full-vocabulary distribution at every positive answer-token position, including the first and later tokens; C versus B tests this alignment objective.' },
      output: { zh: '三组各含三个固定种子轨迹；文本参考和状态恢复检查用于核对训练信号及状态连续性。', en: 'Each arm has three fixed-seed trajectories; the text reference and state-restoration checks audit the training signal and state continuity.' },
      boundary: { zh: '所有组都使用覆盖监督，没有未覆盖组，因而不能从本实验单独估计覆盖监督的因果效果。文本模型与学生的解码器训练历史不同；组间差异也不能单独归因于潜在表示。', en: 'All arms use covered supervision, with no uncovered arm, so this study does not isolate the causal effect of coverage. The text model and student have different decoder-training histories; between-arm differences also cannot be attributed to latent representation alone.' },
      reference: { label: 'v4 §13', page: 30 }
    },
    {
      id: 'v4-system-cost',
      title: { zh: '把完整系统成本算进去', en: 'Count the full system cost' },
      purpose: { zh: '避免只报告驻留槽位、模型参数或最终提交而隐藏周边开销。', en: 'Avoid hiding surrounding costs by reporting only resident slots, model parameters, or the final commit.' },
      input: { zh: '成本边界包括部署读取与写入工作，也包括训练时对动作和未来分支的训练评估器重放。', en: 'The cost boundary includes deployment reads and writes, as well as training-evaluator replay over actions and future branches.' },
      process: { zh: '部署账本计入策略反向传播、优化器和恢复检查，以及候选构造、可信组装与验证、动作评分、提交、路由、索引、归档检索、内存流量、计算内核数量、延迟和能耗。训练账本还计入分支状态和未来重放；共享预计算、动作候选缩减或近似后续模拟必须报告构造成本、遗漏风险和近似误差。', en: 'The deployment ledger counts policy backpropagation, optimizer and reset checks, candidate construction, trusted assembly and validation, action scoring, commit, routing, indexing, archive retrieval, memory traffic, kernel count, latency, and energy. The training ledger also counts branch states and future replay; shared precomputation, action shortlists, or approximate rollouts must report their construction costs, miss risks, and approximation error.' },
      output: { zh: '成本以完整向量和边界呈现，便于与质量、容量和资源匹配的基线比较。', en: 'Costs are reported as a full vector and boundary so quality can be compared with capacity- and resource-matched baselines.' },
      boundary: { zh: '有界 resident memory 不意味着整个系统总信息有界或更省能。理论渐近复杂度不能替代实测开销。', en: 'Bounded resident memory does not imply bounded total system information or lower energy use. Asymptotic complexity does not replace measured cost.' },
      reference: { label: 'v4 §3.6', page: 16 }
    },
    {
      id: 'v4-evidence-gates',
      title: { zh: '按证据门槛分阶段投入', en: 'Gate investment on evidence' },
      purpose: { zh: '先验证读得出状态，再验证准入有未来价值，最后才考虑联合训练和规模扩展。', en: 'First qualify state readout, then future-valued admission, and only later consider joint training and scale-up.' },
      input: { zh: '输入是一个冻结 backbone、候选状态接口、future-blind value model，以及逐步扩展的预登记比较。', en: 'Inputs are a frozen backbone, candidate state interfaces, a future-blind value model, and preregistered comparisons that expand in stages.' },
      process: { zh: '第一阶段验证 resident state 是否可读、可重建并保持无关事实；第二阶段检验可部署控制器能否在匹配基线下降低未来风险；只有两者通过且没有 collateral damage，才有理由探索 joint training。后续还需独立验证 policy-only effect、admission oracle margin、未来不可见策略和 policy-by-memory factorial。', en: 'The first stage tests whether resident state can be read and reconstructed without damaging unrelated facts; the second asks whether a deployable controller lowers future risk against matched baselines. Joint training is justified only if both pass without collateral damage. Later work must independently qualify the policy-only effect, admission oracle margin, future-blind policy, and policy-by-memory factorial.' },
      output: { zh: '每道门槛只授权下一项明确实验，不自动升级为规模化或完整系统主张。', en: 'Each gate authorizes only the next defined experiment; it does not automatically justify scale-up or a full-system claim.' },
      boundary: { zh: 'v4 将预测准入 oracle 优势、学得的 future-blind policy、严格纯策略 RTT 效果和双状态交互优势都列为未确立。', en: 'V4 lists the predictive-admission oracle margin, learned future-blind policy, strict policy-only RTT effect, and dual-state interaction benefit as unestablished.' },
      reference: { label: 'v4 §3.8', page: 17 }
    },
    {
      id: 'v4-historical-intervention',
      title: { zh: '历史登记的记忆准入比较', en: 'Historical registered admission comparison' },
      purpose: { zh: '说明未来风险记忆实验原本准备怎样区分整合方式和训练目标。', en: 'Describe how the historical future-risk memory study planned to separate consolidation methods and training targets.' },
      input: { zh: '方案要求每组有完全相同的已观察前缀和 4–8 条后续分支，写入前状态与评估时域固定。', en: 'The template requires the same observed prefix and 4–8 continuations per group, with a fixed pre-write state and evaluation horizon.' },
      process: { zh: '五个比较臂为始终不写、即时写入并按当前风险监督、完成片段整合并按当前风险监督、相同整合器按未来期望风险监督，以及仅用于上界的期望风险 oracle。各可训练臂共享冻结模型、容量、候选负载、写入预算、训练暴露与评估预算；从同一快照重放动作，评分时域内不允许再写。', en: 'Five arms are no-write, immediate writing trained on current risk, completed-segment consolidation trained on current risk, the same consolidator trained on expected future risk, and an expected-risk oracle used only as a ceiling. Trainable arms share the frozen model, capacity, candidate payload, write budget, training exposure, and evaluation budget; actions are replayed from the same snapshot, with no later writes in the scoring horizon.' },
      output: { zh: '这是一个未执行的历史预登记模板；报告没有据此得到整合或未来风险监督的实验效果。', en: 'This is an unexecuted historical preregistration template; the report has no experimental result for consolidation or future-risk supervision from it.' },
      boundary: { zh: '这是历史模板，不代表当前下一步计划；其比较依赖先行的接口资格、分组划分和同快照重放。', en: 'This is a historical template, not the current next-step plan; its comparison depends on prior interface qualification, group-wise splits, and replay from the same snapshot.' },
      reference: { label: 'v4 §3.7', page: 16 }
    },
    {
      id: 'v4-evidence-status',
      title: { zh: '组件与系统的评估范围', en: 'Component and system evaluation' },
      purpose: { zh: '说明受控组件证据与整体架构主张各自适用的范围。', en: 'Describe the scope of controlled component evidence and system-level claims.' },
      input: { zh: '输入是截至 2026 年 9 月 13 日完成的受控组件实验、后训练研究和预登记比较。', en: 'The input is controlled component experiments, post-training studies, and preregistered comparisons completed by 13 September 2026.' },
      process: { zh: '生命周期执行、校准检索、类型化锚点—填充项传输及受限读出分别由不同任务和对照评估。整体适应优势还需要可靠语义读出、独立载体干预、完整生命周期恢复和匹配成本归因。', en: 'Lifecycle execution, calibrated retrieval, typed anchor–filler transport, and restricted readout are evaluated on distinct tasks and controls. An overall adaptation benefit also requires reliable semantic readout, independent carrier interventions, complete lifecycle recovery, and matched cost attribution.' },
      output: { zh: '各组件形成独立的任务结果、状态检查与成本记录，系统比较另行记录两种状态共同运行时的表现。', en: 'Each component produces its own task outcomes, state checks, and cost records; system comparisons separately record behavior when both states operate together.' },
      boundary: { zh: '每项结果对应其任务、接口和资源设置；整体比较需要独立的状态干预与统一成本口径。', en: 'Each result applies to its task, interface, and resource settings; system comparisons require independent state interventions and a shared cost definition.' },
      reference: { label: 'v4 §§16–18', page: 38 }
    },
    {
      id: 'v4-appendix-h-protocol',
      title: { zh: '附录 H：历史接口资格与准入协议', en: 'Appendix H: Historical interface and admission protocol' },
      purpose: { zh: '展示历史未来风险准入协议中的先决条件、对照设计和信息边界。', en: 'Show the prerequisites, control design, and information boundary in the historical future-risk admission protocol.' },
      input: { zh: '历史草案要求先有通过资格门槛的接口，再为相同观察前缀收集四至八条后续分支。', en: 'The historical template required a qualified interface first, then four to eight continuations for each identical observed prefix.' },
      process: { zh: '草案要求对每个动作从同一不可变快照重放每条分支，并将 group 而非 branch 分到训练、校准和全新留出集。对照共享冻结模型、槽位、候选负载、写入预算和部署可见信息；部署 value model 只能使用因果历史。oracle 仅作不可部署的上界，且必须先证明它优于 current-risk 基线。', en: 'The template replays every branch for every action from the same immutable snapshot and splits by group, not branch, across training, calibration, and fresh held-out data. Controls share the frozen model, slots, candidate payload, write budget, and deployment-visible information; the deployed value model may use only causal history. The oracle is a non-deployable ceiling, and must first beat the current-risk baseline.' },
      output: { zh: '附录保留的是一项历史预登记参考，而不是已执行的准入实验或当前获验证的下一步。', en: 'The appendix preserves a historical preregistration reference, not an executed admission experiment or a currently validated next step.' },
      boundary: { zh: '附录 H 是历史协议，不是已执行的准入实验；其中多未来比较和学得准入器属于待评估机制。', en: 'Appendix H is a historical protocol, not an executed admission experiment; its multi-future comparison and learned admission controller are mechanisms awaiting evaluation.' },
      reference: { label: 'v4 Appendix H', page: 211 }
    }
  ]
});
