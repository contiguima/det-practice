/**
 * Builds data/fill-in-the-blanks.json from the curriculum table.
 * Run: node scripts/build-fitb-data.mjs
 */
import fs from "fs";
import path from "path";

/** @type {Array<{level:'B1'|'B2', kind:'word'|'review', word:string, definition:string, explanation:string, prompt:string, answers:string}>} */
const rows = [
  // —— B1 singles ——
  ["B1","word","adopt","To officially accept or start using something new.","The company is choosing a policy employees will follow from now on.","The company decided to a_ _ _ _ the new policy to improve employee satisfaction.","adopt"],
  ["B1","word","went","Past tense of go; moved to a place.","They chose to take a walk despite bad weather.","Even though it was raining they w_ _ _ for a walk in the park.","went"],
  ["B1","word","unique","Being the only one of its kind; unlike anything else.","The style cannot be copied easily by others.","She has a very u_ _ _ _ _ style of painting that no one can replicate.","unique"],
  ["B1","word","focus","To concentrate attention or effort on one thing.","Success requires clear priorities and hard work.","If you want to succeed you must f_ _ _ _ on your goals and work hard.","focus"],
  ["B1","word","process","A series of actions taken to achieve a result.","The scientist explains how the reaction works step by step.","The scientist explained the p_ _ _ _ _ _ behind the chemical reaction.","process"],
  ["B1","word","because","For the reason that; since.","Trains are preferred for environmental reasons.","Most people prefer to travel by train b_ _ _ _ _ _ it is more environmentally friendly.","because"],
  ["B1","word","detailed","Including many specific facts or aspects.","The manager wants depth, not a short summary.","The manager asked for a d_ _ _ _ _ _ report on the project's progress.","detailed"],
  ["B1","word","engrossed","Completely absorbed and focused on something.","He was so focused he did not notice the doorbell.","He was so e_ _ _ _ _ _ _ in his book that he didn't hear the doorbell.","engrossed"],
  ["B1","word","demand","A strong desire or need for a product.","High demand made the phones sell out quickly.","Due to the high d_ _ _ _ _ the store ran out of the new smartphones in an hour.","demand"],
  ["B1","word","solution","An answer to a problem.","They must solve the issue before the deadline.","We need to find a s_ _ _ _ _ _ _ to this problem before the deadline.","solution"],
  ["B1","word","says","States something; third-person form of say.","The forecast gives tomorrow's weather.","The weather forecast s_ _ _ that it will be sunny tomorrow afternoon.","says"],
  ["B1","word","respond","To reply or react to a message.","They want a quick reply to the email.","Please r_ _ _ _ _ _ to the email as soon as you have the information.","respond"],
  ["B1","word","language","A system of communication used by people.","Learning it can improve career options.","Learning a new l_ _ _ _ _ _ _ can open up many career opportunities.","language"],
  ["B1","word","postpone","To delay an event to a later time.","The meeting will happen next week instead.","They decided to p_ _ _ _ _ _ the meeting until next Wednesday.","postpone"],
  ["B1","word","amazing","Causing great surprise or admiration.","The audience reacted with strong applause.","Her performance was a_ _ _ _ _ _ and everyone in the audience cheered.","amazing"],
  ["B1","word","located","Situated in a particular place.","The museum is in the city center.","The museum is l_ _ _ _ _ _ in the heart of the city center.","located"],
  ["B1","word","forward","Toward the front; in look forward to, to anticipate.","He is excited about the upcoming conference.","I am looking f_ _ _ _ _ _ to seeing you at the conference.","forward"],
  ["B1","word","increased","Became greater in amount or degree.","Ticket prices are higher than last year.","The price of the tickets i_ _ _ _ _ _ _ compared to last year.","increased"],
  ["B1","word","late","After the expected or usual time.","He apologized for not arriving on time.","He apologized for being l_ _ _ to the appointment this morning.","late"],
  ["B1","word","passionate","Having or showing strong enthusiasm.","She cares deeply and always tries her best.","She is very p_ _ _ _ _ _ _ about her work and always does her best.","passionate"],
  // —— B2 singles (first block) ——
  ["B2","word","rapid","Happening in a short time; very fast.","Urban population growth is fast and affects housing.","The r_ _ _ _ growth of the urban population has led to a housing shortage in many metropolitan areas.","rapid"],
  ["B2","word","sustainable","Able to continue without harming the environment long term.","Energy sources should replace fossil fuels.","Environmentalists advocate for s_ _ _ _ _ _ _ _ _ energy sources to replace fossil fuels.","sustainable"],
  ["B2","word","measures","Official actions taken to achieve a goal.","The government acted to help the economy.","The government implemented new m_ _ _ _ _ _ _ to stimulate the struggling economy.","measures"],
  ["B2","word","convincing","Persuasive and believable.","His argument changed how people voted.","His argument was c_ _ _ _ _ _ _ _ and persuaded most of the committee members to vote in favor.","convincing"],
  ["B2","word","advancements","Important steps forward; progress.","Technology changed global communication.","Technological a_ _ _ _ _ _ _ _ _ _ have significantly transformed the way we communicate globally.","advancements"],
  ["B2","word","maintain","To keep something in good condition over time.","Balance between work and life is important.","It is essential to m_ _ _ _ _ _ _ a healthy balance between work and personal life.","maintain"],
  ["B2","word","indicate","To show or suggest something.","Study results point to a clear link.","The results of the study i_ _ _ _ _ _ _ that there is a strong correlation between diet and health.","indicate"],
  ["B2","word","achieve","To succeed in reaching a goal.","The team met its sales targets despite obstacles.","Despite the obstacles the team managed to a_ _ _ _ _ _ its annual sales targets.","achieve"],
  ["B2","word","impact","A strong effect or influence.","AI will change jobs in major ways.","Artificial intelligence is expected to have a profound i_ _ _ _ _ on the future job market.","impact"],
  ["B2","word","encourage","To give support or confidence to do something.","Teachers should support critical thinking.","Teachers should e_ _ _ _ _ _ _ _ students to think critically and express their ideas clearly.","encourage"],
  ["B2","word","scarcity","A situation in which there is not enough of something.","Fresh water is limited in dry regions.","The p_ _ _ _ _ _ _ of fresh water is a growing concern in many arid regions of the world.","scarcity"],
  ["B2","word","pursue","To follow or work toward a goal over time.","She chose medicine after volunteering.","She decided to p_ _ _ _ _ a career in medicine after volunteering at a local hospital.","pursue"],
  ["B2","word","insight","A deep and accurate understanding.","The novel reveals life during industrialization.","The novel provides an i_ _ _ _ _ _ into the lives of people living during the Industrial Revolution.","insight"],
  ["B2","word","conducting","Carrying out or organizing (research).","Researchers are running experiments.","Researchers are c_ _ _ _ _ _ _ _ _ experiments to find a cure for the rare disease.","conducting"],
  ["B2","word","largely","Mostly; for the most part.","Marketing strategies explain much of the success.","The company's success is l_ _ _ _ _ _ attributed to its innovative marketing strategies.","largely"],
  ["B2","word","evaluate","To judge or assess carefully.","Investors should study risks first.","It is crucial to a_ _ _ _ _ _ _ the potential risks before investing in the stock market.","evaluate"],
  ["B2","word","blend","A mixture of different elements.","The building mixes modern and traditional design.","The architecture of the building is a perfect b_ _ _ _ of modern and traditional styles.","blend"],
  ["B2","word","foster","To encourage the development of something.","The conference promotes international cooperation.","The conference aims to f_ _ _ _ _ collaboration between scientists from different countries.","foster"],
  ["B2","word","exchange","The act of giving and receiving; cultural trade.","Globalization increases cultural contact.","Globalization has led to increased cultural e_ _ _ _ _ _ _ and economic interdependence.","exchange"],
  ["B2","word","ensure","To make certain that something happens.","Laws protect privacy rights.","The laws were updated to e_ _ _ _ _ the protection of individual privacy rights.","ensure"],
];

/** B1 reviews (every 5 words) — generated 2-paragraph passages */
const b1Reviews = [
  {
    level: "B1",
    title: "Review · Words 1–5",
    relatedWords: ["adopt","went","unique","focus","process"],
    paragraphs: [
      "Last month our team voted to a_ _ _ _ a shorter feedback cycle so managers could hear concerns earlier. Even when the office was closed, a few colleagues still w_ _ _ to the co-working space to finish their presentations.",
      "The designer’s u_ _ _ _ _ use of color made the report easy to remember. To f_ _ _ _ on quality, we paused new features and documented the p_ _ _ _ _ _ we used for testing each release.",
    ],
    answers: ["adopt","went","unique","focus","process"],
    explanation: "This review combines policy adoption, movement, distinctive style, concentration, and a step-by-step method.",
  },
  {
    level: "B1",
    title: "Review · Words 6–10",
    relatedWords: ["because","detailed","engrossed","demand","solution"],
    paragraphs: [
      "Commuters prefer the train b_ _ _ _ _ _ it produces fewer emissions per trip. The analyst wrote a d_ _ _ _ _ _ summary that listed costs, risks, and next steps for the board.",
      "He was so e_ _ _ _ _ _ _ in the manuscript that he missed two messages. After demand surged online, the team proposed a practical s_ _ _ _ _ _ _ that could ship within two weeks.",
    ],
    answers: ["because","detailed","engrossed","demand","solution"],
    explanation: "Connectors, precision, focus, market pressure, and problem-solving appear in realistic workplace contexts.",
  },
  {
    level: "B1",
    title: "Review · Words 11–15",
    relatedWords: ["says","respond","language","postpone","amazing"],
    paragraphs: [
      "The coordinator s_ _ _ the kickoff will begin at nine, so please r_ _ _ _ _ _ before Friday if you need accommodations. Studying a second l_ _ _ _ _ _ _ helped her interview with confidence.",
      "They had to p_ _ _ _ _ _ the workshop because the speaker was ill, but the rehearsal still looked a_ _ _ _ _ _ and motivated the whole class.",
    ],
    answers: ["says","respond","language","postpone","amazing"],
    explanation: "Communication verbs and time management vocabulary are practiced in event-planning scenarios.",
  },
  {
    level: "B1",
    title: "Review · Words 16–20",
    relatedWords: ["located","forward","increased","late","passionate"],
    paragraphs: [
      "The gallery is l_ _ _ _ _ _ near the river, and visitors are looking f_ _ _ _ _ _ to the new exhibit. Ticket prices have i_ _ _ _ _ _ _ slightly, yet attendance remains strong.",
      "He was ten minutes l_ _ _ because of traffic, but his speech was so p_ _ _ _ _ _ _ _ that the audience stayed engaged until the end.",
    ],
    answers: ["located","forward","increased","late","passionate"],
    explanation: "Location, anticipation, change, punctuality, and enthusiasm are reviewed in a cultural event context.",
  },
];

/** B2 reviews (every 5 words, words 21–40) */
const b2ReviewsCustom = [
  {
    level: "B2",
    title: "Review · Words 21–25",
    relatedWords: ["rapid","sustainable","measures","convincing","advancements"],
    paragraphs: [
      "The r_ _ _ _ growth of the urban population has increased demand for housing. Environmental groups argue that cities need s_ _ _ _ _ _ _ _ _ _ planning to reduce emissions over decades.",
      "The government introduced new m_ _ _ _ _ _ _ to support small businesses. The minister gave a c_ _ _ _ _ _ _ _ argument for the plan, citing recent technological a_ _ _ _ _ _ _ _ _ _ _ in clean energy.",
    ],
    answers: ["rapid","sustainable","measures","convincing","advancements"],
    explanation: "Urban growth, sustainability, policy, persuasion, and progress vocabulary in a policy context.",
  },
  {
    level: "B2",
    title: "Review · Words 26–30",
    relatedWords: ["maintain","indicate","achieve","impact","encourage"],
    paragraphs: [
      "It is hard to m_ _ _ _ _ _ _ focus when notifications interrupt you every few minutes. Early results i_ _ _ _ _ _ _ that the new schedule improved sleep quality for most participants.",
      "The team managed to a_ _ _ _ _ _ its quarterly goals despite supply delays. Experts warn that automation will have a major i_ _ _ _ _ on entry-level roles, so schools should e_ _ _ _ _ _ _ _ students to learn adaptable skills.",
    ],
    answers: ["maintain","indicate","achieve","impact","encourage"],
    explanation: "Balance, evidence, success, influence, and motivation appear in workplace and education settings.",
  },
  {
    level: "B2",
    title: "Review · Words 31–35",
    relatedWords: ["scarcity","pursue","insight","conducting","largely"],
    paragraphs: [
      "Water s_ _ _ _ _ _ _ in dry regions makes irrigation costly for farmers. After volunteering abroad, she decided to p_ _ _ _ _ a career in public health.",
      "The biography offers deep i_ _ _ _ _ _ into how the company was founded. Researchers are c_ _ _ _ _ _ _ _ _ a trial that is l_ _ _ _ _ funded by international grants.",
    ],
    answers: ["scarcity","pursue","insight","conducting","largely"],
    explanation: "Shortage, ambition, understanding, research activity, and degree adverbs are reviewed together.",
  },
  {
    level: "B2",
    title: "Review · Words 36–40",
    relatedWords: ["evaluate","blend","foster","exchange","ensure"],
    paragraphs: [
      "Before signing the contract, investors should e_ _ _ _ _ _ _ the risks carefully. The café interior is a thoughtful b_ _ _ _ of industrial and cozy design.",
      "The program aims to f_ _ _ _ _ collaboration between universities. Global trade has increased cultural e_ _ _ _ _ _ _ , and new rules e_ _ _ _ _ fair competition in the market.",
    ],
    answers: ["evaluate","blend","foster","exchange","ensure"],
    explanation: "Assessment, mixture, support, trade, and certainty vocabulary close the B2 word set.",
  },
];

/** Legacy B2 review prompts (not used in learn path) */
const b2Reviews = [
  ["The recent f_ _ _ _ _ _ _ _ _ in the stock market have caused concern among investors. While some experts predict a quick r_ _ _ _ _ _ _, others remain cautious about the long-term economic outlook.","fluctuations|recovery","Market volatility and expected rebound."],
  ["S_ _ _ _ _ _ _ _ _ _ urban planning is essential for creating livable cities. This involves not only improving p_ _ _ _ _ transportation but also increasing green spaces and reducing carbon emissions.","Sustainable|public","Urban design and shared infrastructure."],
  ["The d_ _ _ _ _ _ _ _ _ _ of renewable energy technology is a key factor in mitigating climate change. Scientists are constantly seeking more e_ _ _ _ _ _ _ _ ways to capture solar and wind power.","development|efficient","Clean-tech progress and performance."],
  ["Digital transformation has r_ _ _ _ _ _ _ _ _ _ _ _ _ the retail industry. Consumers now expect a seamless shopping e_ _ _ _ _ _ _ _ across both online and physical stores.","revolutionized|experience","Retail change and customer journey."],
  ["The study highlights the i_ _ _ _ _ _ _ _ _ of early childhood education. Children who attend preschool are often better p_ _ _ _ _ _ _ for the academic challenges of primary school.","importance|prepared","Early learning benefits."],
  ["Effective leadership requires the ability to i_ _ _ _ _ _ and motivate others. A leader must be able to communicate a clear v_ _ _ _ _ and build trust within the team.","inspire|vision","Leadership and direction."],
  ["The preservation of biodiversity is vital for the h_ _ _ _ _ of our planet. The loss of a single species can have u_ _ _ _ _ _ _ _ _ _ consequences for the entire ecosystem.","health|unforeseen","Ecology and risk."],
  ["Technological innovation is often d_ _ _ _ _ by a desire to solve complex problems. Companies that invest in r_ _ _ _ _ _ _ and development are more likely to stay competitive.","driven|research","Innovation drivers."],
  ["The i_ _ _ _ _ _ _ _ _ _ _ of remote work has changed the traditional office environment. Many employees now enjoy the f_ _ _ _ _ _ _ _ _ _ of working from home at least part of the time.","implementation|flexibility","Workplace change."],
  ["Addressing global poverty requires a m_ _ _ _ _ _ _ _ _ _ _ approach. This includes improving access to education, healthcare, and e_ _ _ _ _ _ _ opportunities for all.","multifaceted|economic","Development policy."],
  ["The d_ _ _ _ _ over climate change policy has become increasingly polarized. It is difficult to reach a c_ _ _ _ _ _ _ _ when there are such diverging views on the necessary actions.","debate|consensus","Policy disagreement."],
  ["Artificial intelligence has the p_ _ _ _ _ _ _ _ to enhance productivity across various industries. However, it also raises ethical q_ _ _ _ _ _ _ _ regarding data privacy and job displacement.","potential|questions","AI benefits and ethics."],
  ["The r_ _ _ _ _ _ _ _ of the global economy depends on the stability of financial markets. Central banks play a crucial role in m_ _ _ _ _ _ _ _ inflation and promoting growth.","resilience|monitoring","Macroeconomic stability."],
  ["The novel's p_ _ _ _ is complex and full of unexpected twists. The author uses vivid d_ _ _ _ _ _ _ _ _ _ _ to bring the characters and settings to life for the reader.","plot|descriptions","Literary craft."],
  ["Scientific research is based on the p_ _ _ _ _ _ _ _ of objective observation and experimentation. Findings must be peer-reviewed to ensure their a_ _ _ _ _ _ _ and reliability.","principle|accuracy","Research standards."],
  ["The city's infrastructure needs s_ _ _ _ _ _ _ _ _ _ investment to meet the needs of its growing population. This includes upgrading roads, bridges, and p_ _ _ _ _ utilities.","significant|public","Urban investment."],
  ["Cultural heritage provides a sense of i_ _ _ _ _ _ _ and belonging for communities. It is important to protect h_ _ _ _ _ _ _ _ sites for the benefit of future generations.","identity|historical","Heritage preservation."],
  ["The e_ _ _ _ _ _ _ _ _ _ impact of tourism can be both positive and negative. While it generates revenue, it can also lead to the d_ _ _ _ _ _ _ _ _ _ of natural habitats.","environmental|destruction","Tourism trade-offs."],
  ["Space exploration has expanded our u_ _ _ _ _ _ _ _ _ _ _ of the universe. Missions to Mars and other planets provide valuable data about the o_ _ _ _ _ _ of our solar system.","understanding|origins","Space science."],
  ["The p_ _ _ _ _ _ _ _ _ _ _ _ of the workforce is essential for economic prosperity. Policies that support lifelong learning and s_ _ _ _ _ development are key to achieving this.","productivity|skills","Labor and training."],
  ["The integration of technology into the classroom has r_ _ _ _ _ _ _ _ _ _ _ _ _ the learning experience. Students can now access a wealth of i_ _ _ _ _ _ _ _ _ _ from around the world at their fingertips.","revolutionized|information","EdTech access."],
  ["The success of a marketing campaign depends on u_ _ _ _ _ _ _ _ _ _ _ _ the target audience. Marketers must analyze consumer b_ _ _ _ _ _ _ to create messages that resonate.","understanding|behavior","Marketing insight."],
  ["The transition to a circular economy requires a shift in how we p_ _ _ _ _ _ and consume goods. The goal is to minimize waste and maximize the r_ _ _ _ _ _ _ _ of resources.","produce|recycling","Circular economy."],
  ["The protection of human rights is a f_ _ _ _ _ _ _ _ _ _ principle of international law. All individuals are entitled to freedom, justice, and e_ _ _ _ _ _ _ regardless of their background.","fundamental|equality","Rights framework."],
  ["The r_ _ _ of social media has transformed the way news is consumed and shared. While it allows for rapid d_ _ _ _ _ _ _ _ _ _ _ of information, it also facilitates the spread of misinformation.","rise|dissemination","Media spread."],
  ["The development of vaccines has been a major m_ _ _ _ _ _ _ _ in public health. Vaccines have saved millions of lives by preventing the s_ _ _ _ _ of infectious diseases.","milestone|spread","Public health."],
  ["The study of history helps us to understand the c_ _ _ _ _ and consequences of past events. By learning from the past, we can make more i_ _ _ _ _ _ _ decisions about the future.","causes|informed","Historical thinking."],
  ["The use of big data analytics has become i_ _ _ _ _ _ _ _ _ _ _ _ in modern business. Companies use data to gain i_ _ _ _ _ _ _ into customer preferences and optimize their operations.","indispensable|insights","Data-driven business."],
  ["The concept of social r_ _ _ _ _ _ _ _ _ _ _ _ _ encourages businesses to consider the impact of their actions on society and the environment. This includes promoting ethical p_ _ _ _ _ _ _ _ and sustainability.","responsibility|practices","CSR."],
  ["The a_ _ _ _ _ _ _ _ _ _ of new technologies often requires significant investment in training. Workers must be able to a_ _ _ _ to changing job requirements to remain employable.","acquisition|adapt","Skills transition."],
  ["The r_ _ _ _ _ _ _ _ of a healthy ecosystem is its ability to withstand and recover from disturbances. Biodiversity plays a c_ _ _ _ _ _ role in maintaining this stability.","resilience|critical","Ecosystem strength."],
  ["The global food system faces the challenge of f_ _ _ _ _ _ a growing population while protecting the environment. This requires more s_ _ _ _ _ _ _ _ _ _ agricultural practices and reduced food waste.","feeding|sustainable","Food security."],
  ["The d_ _ _ _ _ _ migration of people from rural to urban areas has significant social and economic i_ _ _ _ _ _ _ _ _ _ _ _. Cities must adapt their infrastructure to accommodate this influx.","downward|implications","Migration effects."],
  ["The r_ _ _ of the internet has democratized access to information. However, it has also created a d_ _ _ _ _ _ divide between those who have access to technology and those who do not.","rise|digital","Digital access."],
  ["The i_ _ _ _ _ _ _ _ _ _ of renewable energy is a key step towards reducing greenhouse gas emissions. Governments must provide i_ _ _ _ _ _ _ _ _ for companies and individuals to switch to clean energy.","integration|incentives","Energy policy."],
  ["The study of psychology seeks to understand the human m_ _ _ and behavior. Research in this field has important a_ _ _ _ _ _ _ _ _ _ _ in education, healthcare, and business.","mind|applications","Psychology uses."],
  ["The p_ _ _ _ _ _ _ _ of freedom of speech is a cornerstone of democratic societies. It allows for the open e_ _ _ _ _ _ _ of ideas and holds those in power accountable.","principle|exchange","Democratic discourse."],
  ["The r_ _ _ _ growth of e-commerce has led to a surge in the demand for logistics and d_ _ _ _ _ _ _ services. This has created new opportunities for businesses and workers in the sector.","rapid|delivery","E-commerce logistics."],
  ["The conservation of water is becoming i_ _ _ _ _ _ _ _ _ _ _ _ important due to the impacts of climate change. We must adopt more e_ _ _ _ _ _ _ _ ways to use and manage this precious resource.","increasingly|efficient","Water stewardship."],
  ["The i_ _ _ _ _ of globalization on local cultures is a subject of ongoing debate. While it promotes cultural e_ _ _ _ _ _ _ it can also lead to the homogenization of traditions.","impact|exchange","Cultural globalization."],
  ["The d_ _ _ _ _ _ _ _ _ _ of sustainable cities requires a holistic approach that considers social, economic, and environmental f_ _ _ _ _ _. This includes promoting public transit and green buildings.","development|factors","Urban sustainability."],
  ["The study of ethics explores the p_ _ _ _ _ _ _ _ _ of right and wrong behavior. It provides a framework for making d_ _ _ _ _ _ _ _ in complex moral situations.","principles|decisions","Ethics."],
  ["The r_ _ _ of telemedicine has expanded access to healthcare for people in r_ _ _ _ _ areas. This technology allows patients to consult with doctors and specialists from their own homes.","rise|remote","Telehealth."],
  ["The protection of the oceans is vital for the s_ _ _ _ _ _ _ of our planet. Overfishing and pollution are serious t_ _ _ _ _ _ to marine life and the health of the entire ecosystem.","survival|threats","Ocean health."],
  ["The i_ _ _ _ _ _ _ _ _ _ of artificial intelligence into daily life is becoming more prevalent. From virtual assistants to self-driving cars, AI is t_ _ _ _ _ _ _ _ _ _ _ how we live and work.","integration|transforming","AI in daily life."],
  ["The r_ _ _ _ _ of a scientific study must be reproducible to be considered valid. This requires transparent r_ _ _ _ _ _ _ _ of methods and data to allow other researchers to verify the findings.","results|reporting","Scientific rigor."],
  ["The preservation of indigenous languages is essential for maintaining cultural d_ _ _ _ _ _ _ _. These languages hold valuable knowledge about the n_ _ _ _ _ _ world and human history.","diversity|natural","Language preservation."],
  ["The use of r_ _ _ _ _ _ _ _ energy is a key strategy for mitigating the effects of climate change. Switching from fossil fuels to solar and wind power can significantly reduce c_ _ _ _ _ emissions.","renewable|carbon","Clean energy."],
  ["The d_ _ _ _ _ _ _ _ _ _ of new medicines is a long and expensive process. It requires extensive t_ _ _ _ _ _ and clinical trials to ensure that treatments are safe and effective.","development|testing","Pharma R&D."],
  ["The i_ _ _ _ _ of social media on mental health is a growing concern among researchers. Studies suggest a l_ _ _ between excessive screen time and increased levels of anxiety and depression.","impact|link","Digital wellbeing."],
  ["The r_ _ _ _ of the global middle class is driving a surge in the demand for consumer goods. This has significant i_ _ _ _ _ _ _ _ _ _ _ _ for resource consumption and waste management.","rise|implications","Consumer growth."],
  ["The study of linguistics explores the structure and e_ _ _ _ _ _ _ _ of human languages. It provides insights into how we communicate and how language s_ _ _ _ _ our perception of reality.","evolution|shapes","Linguistics."],
  ["The protection of intellectual property is essential for fostering i_ _ _ _ _ _ _ _ _. Laws that protect patents and copyrights encourage individuals and companies to invest in r_ _ _ _ _ _ _ and development.","innovation|research","IP and innovation."],
  ["The transition to a low-carbon economy requires a m_ _ _ _ _ _ transformation of our energy and transportation systems. This involves both technological i_ _ _ _ _ _ _ _ _ and behavioral changes.","massive|innovation","Energy transition."],
  ["The r_ _ _ of the gig economy has changed the nature of work for many people. While it offers f_ _ _ _ _ _ _ _ _ _ it also raises concerns about job security and access to benefits.","rise|flexibility","Gig work."],
  ["The study of sociology examines the r_ _ _ _ _ _ _ _ _ _ _ _ between individuals and society. It explores how social structures and institutions influence human b_ _ _ _ _ _ _.","relationships|behavior","Sociology."],
];

function makeExamples(word, definition, context) {
  const base = context.trim().endsWith(".") ? context.trim() : `${context.trim()}.`;
  const defShort = definition.replace(/\.$/, "");
  return [
    base,
    `Try using "${word}" in a sentence about work, study, or daily life.`,
    `Quick check: "${word}" means ${defShort.charAt(0).toLowerCase()}${defShort.slice(1)}.`,
  ];
}

function toWord(row, index) {
  const [level, , word, definition, explanation, prompt, answer] = row;
  return {
    id: `w-${index}`,
    kind: "word",
    level,
    word,
    definition,
    explanation,
    examples: makeExamples(word, definition, explanation),
    prompt,
    answer,
  };
}

function buildReview(level, id, title, paragraphs, answers, explanation, relatedWords) {
  const related = relatedWords ?? answers;
  return {
    id,
    kind: "review",
    level,
    title,
    relatedWords: related,
    paragraphs,
    blanks: answers.map((a, i) => ({
      id: `b${i}`,
      answer: a,
      explanation: `Use "${a}" — it matches the grammar and meaning of this sentence.`,
    })),
    timerSeconds: 90,
    explanation,
  };
}

function splitReviewParagraphs(text) {
  const byDouble = text.split(/\n\n+/).filter(Boolean);
  if (byDouble.length >= 2) return byDouble;
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  if (sentences.length <= 2) return [text];
  const mid = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, mid).join(" "), sentences.slice(mid).join(" ")];
}

const exercises = [];
const allWordRows = rows.filter((r) => r[1] === "word");
const mergedReviews = [...b1Reviews, ...b2ReviewsCustom];

let wi = 0;
let reviewIdx = 0;
allWordRows.forEach((row, i) => {
  exercises.push(toWord(row, ++wi));
  if ((i + 1) % 5 === 0 && mergedReviews[reviewIdx]) {
    const r = mergedReviews[reviewIdx++];
    const chunkWords = allWordRows.slice(i - 4, i + 1).map((x) => x[2]);
    exercises.push(
      buildReview(
        row[0],
        `r-${reviewIdx}`,
        r.title ?? `Review · Words ${i - 3}–${i + 1}`,
        r.paragraphs,
        r.answers,
        r.explanation,
        chunkWords,
      ),
    );
  }
});

const outPath = path.join(process.cwd(), "data", "fill-in-the-blanks.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ exercises }, null, 2));
console.log(`Wrote ${exercises.length} exercises to ${outPath}`);
