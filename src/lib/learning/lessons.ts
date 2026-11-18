import type { Language } from '@/lib/i18n/translations';

export interface LessonContent {
  title: string;
  description: string;
  content: string[];
}

export interface LocalizedLesson extends LessonContent {
  id: string;
  categoryId: string;
  category: string;
  difficulty: string;
  duration: string;
  completed: boolean;
}

interface LessonDefinition {
  id: string;
  categoryId: string;
  category: Record<Language, string>;
  difficulty: Record<Language, string>;
  durationMinutes: number;
  completed: boolean;
  translations: Record<Language, LessonContent>;
}

const LESSONS: LessonDefinition[] = [
  {
    id: '1',
    categoryId: 'fundamentals',
    category: {
      en: 'Chess Fundamentals',
      fr: 'Les bases des échecs',
      ar: 'أساسيات الشطرنج',
    },
    difficulty: { en: 'Beginner', fr: 'Débutant', ar: 'مبتدئ' },
    durationMinutes: 10,
    completed: true,
    translations: {
      en: {
        title: 'How the Chess Pieces Move',
        description: 'Learn how every piece moves, captures, and controls space.',
        content: [
          'A chessboard has 64 squares in an 8-by-8 grid. Each player starts with 16 pieces: a king, a queen, two rooks, two bishops, two knights, and eight pawns.',
          'The rook moves any number of squares horizontally or vertically. The bishop moves any number of squares diagonally. Neither piece can jump over another piece.',
          'The queen combines the rook’s and bishop’s movement. The king moves one square in any direction, while the knight moves in an L-shape and can jump over pieces.',
          'A pawn moves forward one square, or two squares on its first move. It captures one square diagonally forward. Try each piece on the board before continuing.',
        ],
      },
      fr: {
        title: 'Le déplacement des pièces aux échecs',
        description: 'Apprenez comment chaque pièce se déplace, capture et contrôle l’échiquier.',
        content: [
          'Un échiquier compte 64 cases disposées en 8 rangées et 8 colonnes. Chaque joueur commence avec 16 pièces : un roi, une dame, deux tours, deux fous, deux cavaliers et huit pions.',
          'La tour se déplace d’autant de cases qu’elle le souhaite horizontalement ou verticalement. Le fou se déplace en diagonale. Aucune de ces pièces ne peut sauter par-dessus une autre.',
          'La dame combine les déplacements de la tour et du fou. Le roi avance d’une case dans n’importe quelle direction. Le cavalier se déplace en L et peut sauter par-dessus les pièces.',
          'Le pion avance d’une case, ou de deux lors de son premier coup. Il capture une pièce en avançant d’une case en diagonale. Essayez chaque pièce sur l’échiquier avant de continuer.',
        ],
      },
      ar: {
        title: 'كيفية تحرك قطع الشطرنج',
        description: 'تعلّم كيف تتحرك كل قطعة وتلتقط القطع وتسيطر على المساحات.',
        content: [
          'تتكوّن رقعة الشطرنج من 64 مربعاً في 8 صفوف و8 أعمدة. يبدأ كل لاعب بـ16 قطعة: ملك ووزير ورخّين وفيلين وحصانين وثمانية بيادق.',
          'يتحرك الرخ أفقياً أو عمودياً لأي عدد من المربعات، ويتحرك الفيل قطرياً لأي عدد من المربعات. لا تستطيع أي منهما القفز فوق قطعة أخرى.',
          'يجمع الوزير بين حركة الرخ والفيل. يتحرك الملك مربعاً واحداً في أي اتجاه، بينما يتحرك الحصان على شكل حرف L ويستطيع القفز فوق القطع.',
          'يتقدم البيدق مربعاً واحداً، أو مربعين في حركته الأولى. ويأسر قطعة بالتقدم قطرياً مربعاً واحداً. جرّب تحريك كل قطعة على الرقعة قبل المتابعة.',
        ],
      },
    },
  },
  {
    id: '2',
    categoryId: 'opening',
    category: {
      en: 'Opening Principles',
      fr: 'Principes de l’ouverture',
      ar: 'مبادئ الافتتاح',
    },
    difficulty: { en: 'Beginner', fr: 'Débutant', ar: 'مبتدئ' },
    durationMinutes: 12,
    completed: true,
    translations: {
      en: {
        title: 'The Golden Rules of the Opening',
        description: 'Control the center, develop your pieces, and keep your king safe.',
        content: [
          'Fight for the center, especially the e4, d4, e5, and d5 squares. Pawns and pieces that influence the center give your army more room to move.',
          'Develop your knights and bishops toward active squares. Try to bring each minor piece into the game once rather than moving the same piece repeatedly.',
          'Castle when it is safe to do so. Castling protects your king and helps connect your rooks.',
          'Avoid bringing your queen out too early or making unnecessary pawn moves. Before each move, ask whether it develops a piece, contests the center, or protects your king.',
        ],
      },
      fr: {
        title: 'Les règles d’or de l’ouverture',
        description: 'Contrôlez le centre, développez vos pièces et mettez votre roi à l’abri.',
        content: [
          'Luttez pour le centre, en particulier les cases e4, d4, e5 et d5. Les pions et les pièces qui contrôlent le centre offrent davantage d’espace à votre armée.',
          'Développez vos cavaliers et vos fous vers des cases actives. Essayez de développer chaque pièce mineure une fois plutôt que de rejouer plusieurs fois la même.',
          'Roquez lorsque c’est possible sans danger. Le roque protège votre roi et facilite la coordination de vos tours.',
          'Évitez de sortir votre dame trop tôt ou de jouer des coups de pion inutiles. Avant chaque coup, demandez-vous s’il développe une pièce, lutte pour le centre ou protège votre roi.',
        ],
      },
      ar: {
        title: 'القواعد الذهبية للافتتاح',
        description: 'سيطر على الوسط وطوّر قطعك وحافظ على أمان ملكك.',
        content: [
          'تنافس على السيطرة على الوسط، وخاصة المربعات e4 وd4 وe5 وd5. تمنح البيادق والقطع التي تسيطر على الوسط جيشك مساحة أكبر للحركة.',
          'طوّر الحصانين والفيلين إلى مربعات نشطة. حاول إدخال كل قطعة صغيرة إلى اللعب مرة واحدة بدلاً من تحريك القطعة نفسها مراراً.',
          'قم بالتبييت عندما يكون ذلك آمناً. يحمي التبييت ملكك ويساعد على ربط الرخّين.',
          'تجنب إخراج الوزير مبكراً أو تحريك البيادق دون حاجة. قبل كل نقلة، اسأل نفسك: هل تطوّر قطعة، أم تنافس على الوسط، أم تحمي ملكك؟',
        ],
      },
    },
  },
  {
    id: '3',
    categoryId: 'checkmate',
    category: {
      en: 'Checkmate Patterns',
      fr: 'Motifs de mat',
      ar: 'أنماط كش مات',
    },
    difficulty: { en: 'Elementary', fr: 'Élémentaire', ar: 'أساسي' },
    durationMinutes: 15,
    completed: false,
    translations: {
      en: {
        title: 'Basic Checkmate Patterns',
        description: 'Recognize the back-rank mate, Scholar’s Mate, and basic rook mates.',
        content: [
          'Checkmate means the king is in check and has no legal way to escape, capture the attacking piece, or block the check.',
          'In a back-rank mate, a rook or queen attacks a king trapped behind its own pawns. Keep an escape square available by moving a pawn in front of your castled king when it is safe.',
          'Scholar’s Mate targets the f7 square with the queen and bishop. Watch for threats against f2 or f7, and defend them without weakening your king.',
          'In a rook-and-king mate, use your rook to cut off ranks or files, bring your king closer, and steadily push the opposing king toward the edge.',
        ],
      },
      fr: {
        title: 'Les mats élémentaires',
        description: 'Reconnaissez le mat du couloir, le mat du berger et les mats avec une tour.',
        content: [
          'Il y a échec et mat lorsque le roi est attaqué et qu’il ne peut ni s’échapper, ni capturer la pièce attaquante, ni parer l’échec.',
          'Dans le mat du couloir, une tour ou une dame attaque un roi bloqué derrière ses propres pions. Lorsque c’est sûr, créez une case de fuite en avançant un pion devant votre roi roqué.',
          'Le mat du berger vise la case f7 avec la dame et le fou. Surveillez les menaces contre f2 ou f7 et défendez ces cases sans affaiblir votre roi.',
          'Pour mater avec une tour et un roi, utilisez la tour pour couper des rangées ou des colonnes, rapprochez votre roi et poussez progressivement le roi adverse vers le bord.',
        ],
      },
      ar: {
        title: 'أنماط كش مات الأساسية',
        description: 'تعرّف على مات الصف الأخير ومات الراعي وأنماط المات بالرخ.',
        content: [
          'يحدث كش مات عندما يكون الملك مهدداً ولا توجد نقلة قانونية للهروب أو أسر القطعة المهاجمة أو صدّ الكش.',
          'في مات الصف الأخير، يهاجم الرخ أو الوزير ملكاً محاصراً خلف بيادقه. اترك مربع هروب بتحريك بيدق أمام الملك بعد التبييت عندما يكون ذلك آمناً.',
          'يستهدف مات الراعي المربع f7 بالوزير والفيل. انتبه إلى التهديدات على f2 أو f7، ودافع عنهما دون إضعاف ملكك.',
          'لتحقيق المات بالرخ والملك، استخدم الرخ لقطع الصفوف أو الأعمدة، وقرّب ملكك، ثم ادفع ملك الخصم تدريجياً نحو حافة الرقعة.',
        ],
      },
    },
  },
  {
    id: '4',
    categoryId: 'tactics',
    category: {
      en: 'Tactical Patterns',
      fr: 'Motifs tactiques',
      ar: 'أنماط تكتيكية',
    },
    difficulty: { en: 'Intermediate', fr: 'Intermédiaire', ar: 'متوسط' },
    durationMinutes: 20,
    completed: false,
    translations: {
      en: {
        title: 'Tactical Motifs: Forks, Pins, and Skewers',
        description: 'Spot double attacks and win material by exploiting vulnerable pieces.',
        content: [
          'A fork is a double attack: one piece attacks two or more enemy targets at once. Knights are especially effective because their attacks are difficult to block.',
          'A pin attacks a piece that cannot move without exposing a more valuable piece behind it, often the king. Check whether the pinned piece is truly unable to move.',
          'A skewer attacks a valuable piece first. When it moves out of danger, a less valuable piece behind it can be captured.',
          'Before moving, look for checks, captures, and threats for both sides. Count the attackers and defenders, and make sure your own pieces are not left undefended.',
        ],
      },
      fr: {
        title: 'Les motifs tactiques : fourchettes, clouages et enfilades',
        description: 'Repérez les attaques doubles et gagnez du matériel en exploitant les pièces vulnérables.',
        content: [
          'Une fourchette est une attaque double : une pièce menace plusieurs cibles à la fois. Les cavaliers sont particulièrement efficaces, car leurs attaques sont difficiles à bloquer.',
          'Un clouage attaque une pièce qui ne peut pas bouger sans exposer une pièce plus importante placée derrière elle, souvent le roi. Vérifiez si la pièce clouée est réellement immobilisée.',
          'Dans une enfilade, une pièce de grande valeur est attaquée en premier. Lorsqu’elle s’écarte, une pièce moins importante située derrière elle peut être capturée.',
          'Avant de jouer, cherchez les échecs, les captures et les menaces pour les deux camps. Comptez les attaquants et les défenseurs et vérifiez que vos pièces ne restent pas sans protection.',
        ],
      },
      ar: {
        title: 'التكتيكات: الشوكة والتثبيت والسيخ',
        description: 'اكتشف الهجمات المزدوجة واربح قطعاً باستغلال القطع الضعيفة.',
        content: [
          'الشوكة هجوم مزدوج: تهاجم قطعة واحدة هدفين أو أكثر في الوقت نفسه. ويكون الحصان فعالاً جداً لأن من الصعب صد هجماته.',
          'يهاجم التثبيت قطعة لا تستطيع التحرك دون كشف قطعة أثمن خلفها، وغالباً ما تكون الملك. تحقق مما إذا كانت القطعة المثبتة عاجزة فعلاً عن الحركة.',
          'في هجوم السيخ، تُهاجَم قطعة ثمينة أولاً. وعندما تبتعد عن الخطر، يمكن أسر قطعة أقل قيمة تقع خلفها.',
          'قبل أن تلعب، ابحث عن الكش والأسر والتهديدات لكلا الطرفين. احسب المهاجمين والمدافعين وتأكد من أن قطعك لن تبقى بلا حماية.',
        ],
      },
    },
  },
  {
    id: '5',
    categoryId: 'strategy',
    category: {
      en: 'Positional Strategy',
      fr: 'Stratégie positionnelle',
      ar: 'الاستراتيجية الموضعية',
    },
    difficulty: { en: 'Advanced', fr: 'Avancé', ar: 'متقدم' },
    durationMinutes: 25,
    completed: false,
    translations: {
      en: {
        title: 'Positional Strategy and Pawn Structures',
        description: 'Understand weak squares, open files, outposts, and pawn chains.',
        content: [
          'A positional advantage is a lasting improvement in your pieces, king safety, pawn structure, or control of important squares, even when no material is won immediately.',
          'An open file has no pawns on it and is a useful route for rooks. Place a rook on an open file, or contest a file that your opponent may use.',
          'An outpost is a square, often in the center, where a piece can be protected by a pawn and cannot easily be driven away by an enemy pawn.',
          'Study pawn chains and weaknesses such as isolated or doubled pawns. Improve your worst-placed piece and avoid creating targets you cannot defend.',
        ],
      },
      fr: {
        title: 'Stratégie positionnelle et structures de pions',
        description: 'Comprenez les cases faibles, les colonnes ouvertes, les avant-postes et les chaînes de pions.',
        content: [
          'Un avantage positionnel améliore durablement vos pièces, la sécurité de votre roi, votre structure de pions ou le contrôle de cases importantes, même sans gain matériel immédiat.',
          'Une colonne ouverte ne contient aucun pion et constitue une voie utile pour les tours. Placez une tour sur une colonne ouverte ou contestez celle que votre adversaire pourrait utiliser.',
          'Un avant-poste est une case, souvent au centre, où une pièce peut être protégée par un pion et difficile à chasser avec un pion adverse.',
          'Étudiez les chaînes de pions et les faiblesses comme les pions isolés ou doublés. Améliorez votre pièce la moins active et évitez de créer des cibles difficiles à défendre.',
        ],
      },
      ar: {
        title: 'الاستراتيجية الموضعية وبنية البيادق',
        description: 'افهم المربعات الضعيفة والأعمدة المفتوحة والمواقع المتقدمة وسلاسل البيادق.',
        content: [
          'الميزة الموضعية تحسّن بشكل مستمر قطعك أو أمان ملكك أو بنية بيادقك أو سيطرتك على مربعات مهمة، حتى دون ربح قطعة فوراً.',
          'العمود المفتوح لا يحتوي على بيادق، وهو طريق مناسب للرخ. ضع رخاً على عمود مفتوح أو نافس على عمود قد يستخدمه خصمك.',
          'الموقع المتقدم مربع، غالباً في الوسط، تستطيع قطعة احتلاله مع حماية بيدق، ويصعب على بيدق الخصم طردها منه.',
          'ادرس سلاسل البيادق ونقاط الضعف مثل البيدق المعزول أو البيادق المزدوجة. حسّن أسوأ قطعك تموضعاً وتجنب إنشاء أهداف يصعب الدفاع عنها.',
        ],
      },
    },
  },
  {
    id: '6',
    categoryId: 'endgame',
    category: {
      en: 'Endgame',
      fr: 'Finales',
      ar: 'نهايات اللعب',
    },
    difficulty: { en: 'Expert', fr: 'Expert', ar: 'خبير' },
    durationMinutes: 30,
    completed: false,
    translations: {
      en: {
        title: 'King and Pawn Endgames',
        description: 'Learn opposition, triangulation, and how to promote a pawn.',
        content: [
          'In king-and-pawn endings, the king becomes an active piece. Bring it toward the center and support your passed pawns.',
          'The opposition occurs when kings face each other with one square between them. The player who is not to move may control the key squares and force the other king to give way.',
          'Before pushing a passed pawn, check the rule of the square: imagine a square from the pawn to its promotion rank. If the opposing king can enter that square, it may catch the pawn.',
          'Use your king to escort the pawn, calculate pawn races carefully, and remember that a pawn promotes only after reaching the final rank.',
        ],
      },
      fr: {
        title: 'Les finales de rois et de pions',
        description: 'Apprenez l’opposition, la triangulation et la promotion des pions.',
        content: [
          'Dans les finales de rois et de pions, le roi devient une pièce active. Amenez-le vers le centre et soutenez vos pions passés.',
          'Il y a opposition lorsque les rois se font face avec une case entre eux. Le joueur qui n’a pas le trait peut contrôler les cases clés et obliger l’autre roi à céder du terrain.',
          'Avant d’avancer un pion passé, appliquez la règle du carré : imaginez un carré allant du pion jusqu’à sa case de promotion. Si le roi adverse peut entrer dans ce carré, il peut rattraper le pion.',
          'Accompagnez le pion avec votre roi, calculez soigneusement les courses de pions et souvenez-vous qu’un pion ne se promeut qu’en atteignant la dernière rangée.',
        ],
      },
      ar: {
        title: 'نهايات الملك والبيدق',
        description: 'تعلّم المعارضة والمثلثة وكيفية ترقية البيدق.',
        content: [
          'في نهايات الملك والبيدق يصبح الملك قطعة نشطة. قرّبه من الوسط وساعد بيادقك المارة على التقدم.',
          'تحدث المعارضة عندما يقف الملكان متقابلين وبينهما مربع واحد. يستطيع اللاعب الذي ليس عليه الدور السيطرة على المربعات المهمة وإجبار الملك الآخر على التراجع.',
          'قبل دفع بيدق مار، طبّق قاعدة المربع: تخيّل مربعاً يمتد من البيدق إلى مربع الترقية. إذا استطاع ملك الخصم دخول هذا المربع، فقد يلحق بالبيدق.',
          'رافق البيدق بملكك، واحسب سباقات البيادق بعناية، وتذكر أن البيدق لا يُرقّى إلا عند بلوغ الصف الأخير.',
        ],
      },
    },
  },
];

export const LESSON_CATEGORIES: Array<{ id: string; label: Record<Language, string> }> = [
  { id: 'all', label: { en: 'All', fr: 'Toutes', ar: 'الكل' } },
  { id: 'fundamentals', label: { en: 'Chess Fundamentals', fr: 'Les bases des échecs', ar: 'أساسيات الشطرنج' } },
  { id: 'opening', label: { en: 'Opening Principles', fr: 'Principes de l’ouverture', ar: 'مبادئ الافتتاح' } },
  { id: 'checkmate', label: { en: 'Checkmate Patterns', fr: 'Motifs de mat', ar: 'أنماط كش مات' } },
  { id: 'tactics', label: { en: 'Tactical Patterns', fr: 'Motifs tactiques', ar: 'أنماط تكتيكية' } },
  { id: 'strategy', label: { en: 'Positional Strategy', fr: 'Stratégie positionnelle', ar: 'الاستراتيجية الموضعية' } },
  { id: 'endgame', label: { en: 'Endgame', fr: 'Finales', ar: 'نهايات اللعب' } },
];

function formatDuration(minutes: number, language: Language) {
  if (language === 'ar') return `${minutes} دقيقة`;
  return `${minutes} min`;
}

export function getLessons(language: Language): LocalizedLesson[] {
  return LESSONS.map((lesson) => ({
    id: lesson.id,
    categoryId: lesson.categoryId,
    category: lesson.category[language],
    difficulty: lesson.difficulty[language],
    duration: formatDuration(lesson.durationMinutes, language),
    completed: lesson.completed,
    ...lesson.translations[language],
  }));
}

export function getLesson(id: string, language: Language): (LocalizedLesson & { categoryId: string }) | undefined {
  const lesson = LESSONS.find((item) => item.id === id);
  if (!lesson) return undefined;

  return {
    id: lesson.id,
    category: lesson.category[language],
    categoryId: lesson.categoryId,
    difficulty: lesson.difficulty[language],
    duration: formatDuration(lesson.durationMinutes, language),
    completed: lesson.completed,
    ...lesson.translations[language],
  };
}
