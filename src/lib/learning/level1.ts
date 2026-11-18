import { Chess } from 'chess.js';
import type { Language } from '@/lib/i18n/translations';
import {
  type AcademyChoice,
  type AcademyQuestion,
  type LocalizedText,
} from '@/lib/learning/academy';

const text = (en: string, fr: string, ar: string): LocalizedText => ({ en, fr, ar });

interface LessonFact {
  topic: LocalizedText;
  statement: LocalizedText;
  explanation: LocalizedText;
  misconception: LocalizedText;
}
export interface AcademyLessonContent {
  id: string;
  levelNumber: 1;
  lessonNumber: number;
  title: LocalizedText;
  summary: LocalizedText;
  objectives: LocalizedText[];
  sections: Array<{ title: LocalizedText; paragraphs: LocalizedText[] }>;
  terminology: Array<{ term: LocalizedText; definition: LocalizedText }>;
  example: { fen: string; solutionMoves: string[]; annotation: LocalizedText };
  commonMistakes: LocalizedText[];
  professionalTips: LocalizedText[];
  exercises: LocalizedText[];
  takeaways: LocalizedText[];
}

interface LessonSeed {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  facts: LessonFact[];
  fen: string;
  bestMove: string;
  annotation: LocalizedText;
}

const lessonSeeds: LessonSeed[] = [
  {
    id: 'l1-01',
    title: text('Introduction to Chess and Board Setup', 'Introduction aux échecs et installation de l’échiquier', 'مقدمة في الشطرنج وإعداد الرقعة'),
    summary: text('Set up the board correctly, identify the pieces, and understand how a game begins.', 'Installez correctement l’échiquier, identifiez les pièces et comprenez le début d’une partie.', 'تعلّم إعداد الرقعة والتعرّف على القطع وكيفية بدء المباراة.'),
    facts: [
      { topic: text('The board', 'L’échiquier', 'الرقعة'), statement: text('The chessboard has eight files and eight ranks, creating 64 squares.', 'L’échiquier compte huit colonnes et huit rangées, soit 64 cases.', 'تتكوّن رقعة الشطرنج من ثمانية أعمدة وثمانية صفوف، أي 64 مربعاً.'), explanation: text('Files run from a to h and ranks from 1 to 8. Every square is named by combining its file and rank.', 'Les colonnes vont de a à h et les rangées de 1 à 8. Chaque case est nommée en combinant sa colonne et sa rangée.', 'تُسمّى الأعمدة من a إلى h والصفوف من 1 إلى 8. يُحدَّد اسم كل مربع بضم اسم العمود إلى رقم الصف.'), misconception: text('The board has 64 files and 8 ranks.', 'L’échiquier compte 64 colonnes et 8 rangées.', 'تحتوي الرقعة على 64 عموداً وثمانية صفوف.') },
      { topic: text('Board orientation', 'L’orientation de l’échiquier', 'اتجاه الرقعة'), statement: text('Place the board with a light-colored square at each player’s lower-right corner.', 'Placez l’échiquier avec une case claire dans le coin inférieur droit de chaque joueur.', 'ضع الرقعة بحيث يكون المربع الفاتح في الزاوية اليمنى السفلية لكل لاعب.'), explanation: text('The rule is “light on right.” From White’s side, h1 is light and a1 is dark. Correct orientation makes the ranks and files line up.', 'La règle est « case claire à droite ». Du côté des Blancs, h1 est claire et a1 est foncée. La bonne orientation aligne correctement rangées et colonnes.', 'القاعدة هي «الفاتح على اليمين». من جهة الأبيض، يكون h1 فاتحاً وa1 داكناً. الاتجاه الصحيح يجعل الصفوف والأعمدة في مواضعها.'), misconception: text('The lower-right square should be dark.', 'La case inférieure droite doit être foncée.', 'يجب أن يكون المربع الأيمن السفلي داكناً.') },
      { topic: text('The back rank', 'La première rangée', 'الصف الخلفي'), statement: text('Each back rank starts rook, knight, bishop, queen, king, bishop, knight, rook.', 'Chaque première rangée commence par tour, cavalier, fou, dame, roi, fou, cavalier, tour.', 'يبدأ الصف الخلفي بالترتيب: رخ، حصان، فيل، وزير، ملك، فيل، حصان، رخ.'), explanation: text('The major pieces occupy the back rank while pawns stand directly in front. The queen starts on her own color: White queen on d1, Black queen on d8.', 'Les pièces majeures occupent la première rangée et les pions se placent devant elles. La dame commence sur sa couleur : dame blanche en d1, dame noire en d8.', 'تقف القطع الرئيسية في الصف الخلفي والبيادق أمامها. تبدأ الملكة على مربع من لونها: البيضاء على d1 والسوداء على d8.'), misconception: text('The queen starts on the opposite color and the king takes the d-file.', 'La dame commence sur la couleur opposée et le roi occupe la colonne d.', 'تبدأ الملكة على مربع من اللون المقابل ويقف الملك على عمود d.') },
      { topic: text('The armies', 'Les armées', 'الجيشان'), statement: text('Each player begins with one king, one queen, two rooks, two bishops, two knights, and eight pawns.', 'Chaque joueur commence avec un roi, une dame, deux tours, deux fous, deux cavaliers et huit pions.', 'يبدأ كل لاعب بملك وملكة ورخّين وفيلين وحصانين وثمانية بيادق.'), explanation: text('That is 16 pieces per side. The king is the piece that must be protected; the other pieces help attack, defend, and control squares.', 'Cela représente 16 pièces par camp. Le roi doit être protégé ; les autres pièces attaquent, défendent et contrôlent les cases.', 'المجموع 16 قطعة لكل لاعب. يجب حماية الملك، بينما تساعد القطع الأخرى على الهجوم والدفاع والسيطرة على المربعات.'), misconception: text('Each side starts with two queens and one rook.', 'Chaque camp commence avec deux dames et une tour.', 'يبدأ كل لاعب بملكتين ورخ واحد.') },
      { topic: text('Starting the game', 'Le début de la partie', 'بدء المباراة'), statement: text('White makes the first move, then the players alternate one move at a time.', 'Les Blancs jouent en premier, puis les joueurs jouent chacun leur tour.', 'يلعب الأبيض أولاً، ثم يتناوب اللاعبان على نقلة واحدة في كل دور.'), explanation: text('A move is a legal action by one player. A turn is not complete until the move is made and the opponent is next to play.', 'Un coup est une action légale d’un joueur. Une fois le coup joué, c’est à l’adversaire de jouer.', 'النقلة هي حركة قانونية للاعب. بعد تنفيذها، ينتقل الدور إلى الخصم.'), misconception: text('Black moves first, and White moves twice before Black can reply.', 'Les Noirs jouent en premier et les Blancs jouent deux fois avant leur réponse.', 'يلعب الأسود أولاً، ثم يلعب الأبيض مرتين قبل أن يرد الأسود.') },
    ],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    bestMove: 'e4',
    annotation: text('e4 is a legal opening move that advances a central pawn and begins the alternating move sequence.', 'e4 est un coup d’ouverture légal qui avance un pion central et lance l’alternance des coups.', 'e4 نقلة افتتاحية قانونية تحرّك بيدقاً مركزياً وتبدأ تبادل النقلات.'),
  },
  {
    id: 'l1-02',
    title: text('Understanding the Chessboard and Coordinates', 'Comprendre l’échiquier et ses coordonnées', 'فهم الرقعة والإحداثيات'),
    summary: text('Read files, ranks, square names, and the central squares accurately.', 'Lisez correctement les colonnes, rangées, noms des cases et cases centrales.', 'تعلّم قراءة الأعمدة والصفوف وأسماء المربعات ومربعات الوسط.'),
    facts: [
      { topic: text('Files', 'Les colonnes', 'الأعمدة'), statement: text('Files are the eight vertical columns named a through h from White’s left to right.', 'Les colonnes sont les huit lignes verticales nommées de a à h, de gauche à droite depuis le côté blanc.', 'الأعمدة هي الخطوط الرأسية الثمانية من a إلى h، من اليسار إلى اليمين من جهة الأبيض.'), explanation: text('A file keeps the same letter from rank 1 to rank 8. For example, the e-file contains e1, e2, e3, and every other e-square.', 'Une colonne conserve la même lettre de la rangée 1 à la rangée 8. La colonne e contient e1, e2, e3 et toutes les autres cases e.', 'يحمل العمود الحرف نفسه من الصف 1 إلى الصف 8. مثلاً يحتوي عمود e على e1 وe2 وe3 وبقية مربعات e.'), misconception: text('Files run horizontally and are numbered 1 through 8.', 'Les colonnes sont horizontales et numérotées de 1 à 8.', 'الأعمدة أفقية وتُرقّم من 1 إلى 8.') },
      { topic: text('Ranks', 'Les rangées', 'الصفوف'), statement: text('Ranks are the eight horizontal rows numbered 1 through 8 from White’s side toward Black.', 'Les rangées sont les huit lignes horizontales numérotées de 1 à 8 depuis le côté blanc vers les Noirs.', 'الصفوف هي الخطوط الأفقية الثمانية المرقّمة من 1 إلى 8 من جهة الأبيض نحو الأسود.'), explanation: text('White’s pieces begin on ranks 1 and 2; Black’s begin on ranks 8 and 7. A rank keeps the same number across the board.', 'Les pièces blanches commencent aux rangées 1 et 2 ; les noires aux rangées 8 et 7. Une rangée garde le même numéro sur toute sa largeur.', 'تبدأ قطع الأبيض في الصفين 1 و2، وقطع الأسود في 8 و7. يحتفظ الصف بالرقم نفسه عبر الرقعة.'), misconception: text('Ranks are vertical lines named a through h.', 'Les rangées sont verticales et nommées de a à h.', 'الصفوف خطوط رأسية تُسمّى من a إلى h.') },
      { topic: text('Naming a square', 'Nommer une case', 'تسمية المربع'), statement: text('A square is written with its file letter first and its rank number second, such as e4.', 'Une case s’écrit avec la lettre de sa colonne puis le numéro de sa rangée, par exemple e4.', 'يُكتب اسم المربع بحرف العمود أولاً ثم رقم الصف، مثل e4.'), explanation: text('Coordinates identify one exact square. “e4” means the intersection of the e-file and fourth rank, not a move or a piece.', 'Les coordonnées désignent une seule case précise. « e4 » est l’intersection de la colonne e et de la quatrième rangée, pas un coup ni une pièce.', 'تحدّد الإحداثيات مربعاً واحداً بالضبط. «e4» هو تقاطع العمود e والصف الرابع، وليس نقلة أو قطعة.'), misconception: text('A square name puts the rank number before the file letter, such as 4e.', 'Le nom d’une case place le numéro avant la lettre, comme 4e.', 'يُكتب رقم الصف قبل حرف العمود، مثل 4e.') },
      { topic: text('White’s perspective', 'Le point de vue des Blancs', 'منظور الأبيض'), statement: text('From White’s side, a1 is at the lower-left and h1 is at the lower-right.', 'Du côté des Blancs, a1 se trouve en bas à gauche et h1 en bas à droite.', 'من جهة الأبيض، يقع a1 أسفل اليسار وh1 أسفل اليمين.'), explanation: text('A board may be flipped for Black, but the square names do not change. Always use coordinates, not screen position, to describe a square.', 'On peut retourner l’échiquier pour les Noirs, mais les noms des cases ne changent pas. Utilisez toujours les coordonnées, pas leur position à l’écran.', 'يمكن قلب الرقعة للأسود، لكن أسماء المربعات لا تتغير. استخدم الإحداثيات لا موضع المربع على الشاشة.'), misconception: text('Flipping the board changes the official names of the squares.', 'Retourner l’échiquier change le nom officiel des cases.', 'قلب الرقعة يغيّر الأسماء الرسمية للمربعات.') },
      { topic: text('The center', 'Le centre', 'الوسط'), statement: text('The four central squares are d4, e4, d5, and e5.', 'Les quatre cases centrales sont d4, e4, d5 et e5.', 'مربعات الوسط الأربعة هي d4 وe4 وd5 وe5.'), explanation: text('Central squares matter because pieces placed near the center can influence more of the board. Control can come from occupying a square or attacking it.', 'Les cases centrales sont importantes : une pièce proche du centre peut influencer davantage l’échiquier. On peut contrôler une case en l’occupant ou en l’attaquant.', 'مربعات الوسط مهمة لأن القطع القريبة منها تؤثر في مساحة أكبر. يمكن السيطرة عليها باحتلالها أو مهاجمتها.'), misconception: text('The four central squares are a1, h1, a8, and h8.', 'Les quatre cases centrales sont a1, h1, a8 et h8.', 'مربعات الوسط هي a1 وh1 وa8 وh8.') },
    ],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    bestMove: 'Nf3',
    annotation: text('Nf3 is a legal move from g1 to f3; the file letter and rank number identify each square.', 'Nf3 est un coup légal de g1 à f3 ; la lettre de colonne et le numéro de rangée identifient chaque case.', 'Nf3 نقلة قانونية من g1 إلى f3؛ يحدّد حرف العمود ورقم الصف كل مربع.'),
  },
  {
    id: 'l1-03',
    title: text('The King: Movement and Rules', 'Le roi : déplacements et règles', 'الملك: الحركة والقواعد'),
    summary: text('Learn the king’s movement, check, legal safety, and the king’s role in the game.', 'Apprenez les déplacements du roi, l’échec, sa sécurité et son rôle dans la partie.', 'تعلّم حركة الملك والكش وأمانه ودوره في المباراة.'),
    facts: [
      { topic: text('King movement', 'Le déplacement du roi', 'حركة الملك'), statement: text('The king moves one square in any direction, including horizontally, vertically, or diagonally.', 'Le roi se déplace d’une case dans toutes les directions : horizontalement, verticalement ou en diagonale.', 'يتحرك الملك مربعاً واحداً في أي اتجاه: أفقياً أو عمودياً أو قطرياً.'), explanation: text('The king has a short range, so safety matters more than speed. Its legal destinations are limited to neighboring squares that are not occupied by a friendly piece or attacked by the opponent.', 'Le roi a une portée limitée : sa sécurité prime sur la vitesse. Il ne peut aller que sur une case voisine libre ou occupée par une pièce adverse non protégée.', 'مدى الملك قصير، لذا تهم سلامته أكثر من السرعة. لا ينتقل إلا إلى مربع مجاور خالٍ أو تشغله قطعة خصم غير محمية.'), misconception: text('The king can move any number of unobstructed squares like a queen.', 'Le roi peut parcourir autant de cases libres que la dame.', 'يستطيع الملك التحرك أي عدد من المربعات مثل الملكة.') },
      { topic: text('Attacked squares', 'Les cases attaquées', 'المربعات المهاجَمة'), statement: text('A king may never move onto a square attacked by an opposing piece.', 'Un roi ne peut jamais se déplacer sur une case attaquée par une pièce adverse.', 'لا يجوز للملك الانتقال إلى مربع تهاجمه قطعة للخصم.'), explanation: text('A square can be attacked even if the attacking piece is pinned and could not legally move without exposing its own king. Check the opponent’s attacks before selecting a king move.', 'Une case peut être attaquée même si la pièce adverse est clouée et ne pourrait pas bouger légalement. Vérifiez les attaques avant de choisir un coup de roi.', 'قد يكون المربع مهاجَماً حتى إن كانت القطعة المهاجمة مثبتة ولا تستطيع التحرك قانونياً. افحص هجمات الخصم قبل تحريك الملك.'), misconception: text('A king can enter check if it captures the attacking piece on the same move.', 'Le roi peut se mettre en échec s’il capture la pièce attaquante dans le même coup.', 'يمكن للملك أن يدخل في كش إذا أسر القطعة المهاجمة في النقلة نفسها.') },
      { topic: text('Kings stay apart', 'Les rois restent éloignés', 'يجب أن يبقى الملكان متباعدين'), statement: text('The two kings can never occupy adjacent squares because each king attacks its neighboring squares.', 'Les deux rois ne peuvent jamais être sur des cases voisines, car chacun attaque les cases autour de lui.', 'لا يجوز أن يقف الملكان على مربعين متجاورين لأن كل ملك يهاجم المربعات المحيطة به.'), explanation: text('Kings do not capture one another. The restriction follows from the rule against moving into attack: a king next to the opposing king would be in check.', 'Les rois ne se capturent pas. Cette règle découle de l’interdiction d’entrer en échec : deux rois voisins se menaceraient.', 'لا يأسر الملك ملكاً آخر. تنبع القاعدة من منع دخول الكش؛ فالملكان المتجاوران يهاجم كل منهما الآخر.'), misconception: text('Kings may stand next to each other as long as neither moves.', 'Les rois peuvent être voisins tant qu’aucun ne bouge.', 'يمكن أن يتجاور الملكان ما داما لا يتحركان.') },
      { topic: text('Answering check', 'Répondre à l’échec', 'الرد على الكش'), statement: text('When your king is in check, your move must remove the check immediately.', 'Lorsque votre roi est en échec, votre coup doit immédiatement parer l’échec.', 'عندما يكون ملكك في كش، يجب أن تزيل التهديد في نقلة واحدة فوراً.'), explanation: text('Possible replies include moving the king, capturing the checking piece, or blocking a sliding attack when a block is possible. A move that leaves the king attacked is illegal.', 'On peut déplacer le roi, capturer l’attaquant ou interposer une pièce contre une attaque à distance. Un coup qui laisse le roi en échec est illégal.', 'يمكن تحريك الملك أو أسر القطعة المهاجمة أو صد هجوم خطّي بقطعة إن أمكن. النقلة التي تترك الملك مهدداً غير قانونية.'), misconception: text('A player may ignore check and make any legal-looking move.', 'Un joueur peut ignorer l’échec et jouer un coup qui semble légal.', 'يمكن للاعب تجاهل الكش وتنفيذ أي نقلة تبدو قانونية.') },
      { topic: text('The king in the endgame', 'Le roi en finale', 'الملك في نهاية اللعب'), statement: text('When many attacking pieces have been exchanged, the king can become an active fighting piece.', 'Lorsque de nombreuses pièces d’attaque ont été échangées, le roi peut devenir une pièce active.', 'عندما تُبادَل قطع كثيرة، يستطيع الملك أن يصبح قطعة نشطة في القتال.'), explanation: text('In the opening and middlegame, shelter the king from threats. In many endgames, bring it toward the center to support pawns and restrict the opposing king, while still avoiding attacked squares.', 'En ouverture et au milieu de jeu, mettez le roi à l’abri. Dans de nombreuses finales, rapprochez-le du centre pour soutenir les pions, sans jamais entrer sur une case attaquée.', 'في الافتتاح والوسط احمِ الملك. وفي كثير من النهايات قرّبه من الوسط لدعم البيادق، مع تجنب المربعات المهاجَمة دائماً.'), misconception: text('The king should remain hidden in the corner for the entire game.', 'Le roi doit rester caché dans un coin pendant toute la partie.', 'ينبغي أن يبقى الملك مختبئاً في الزاوية طوال المباراة.') },
    ],
    fen: '7k/8/8/8/8/8/8/4K3 w - - 0 1',
    bestMove: 'Kd2',
    annotation: text('Kd2 is legal in this position: the king moves one square and does not enter an attacked square.', 'Kd2 est légal dans cette position : le roi avance d’une case sans entrer sur une case attaquée.', 'Kd2 قانونية هنا: يتحرك الملك مربعاً واحداً ولا يدخل مربعاً مهدداً.'),
  },
  {
    id: 'l1-04',
    title: text('The Queen: Movement and Power', 'La dame : déplacements et puissance', 'الملكة: الحركة والقوة'),
    summary: text('Use the queen’s range wisely and avoid exposing it to attacks.', 'Utilisez la portée de la dame avec discernement et évitez de l’exposer.', 'استخدم مدى الملكة بحكمة وتجنب تعريضها للهجوم.'),
    facts: [
      { topic: text('Queen movement', 'Le déplacement de la dame', 'حركة الملكة'), statement: text('The queen moves any number of unobstructed squares along a rank, file, or diagonal.', 'La dame se déplace d’autant de cases libres qu’elle le souhaite sur une rangée, une colonne ou une diagonale.', 'تتحرك الملكة أي عدد من المربعات الخالية أفقياً أو عمودياً أو قطرياً.'), explanation: text('The queen combines the rook’s straight-line movement with the bishop’s diagonal movement. It cannot change direction during a single move.', 'La dame combine les déplacements rectilignes de la tour et les diagonales du fou. Elle ne peut pas changer de direction pendant un même coup.', 'تجمع الملكة بين حركة الرخ المستقيمة والفيل القطرية، ولا تغيّر اتجاهها أثناء النقلة الواحدة.'), misconception: text('The queen moves like a knight and may jump over pieces.', 'La dame se déplace comme un cavalier et peut sauter par-dessus les pièces.', 'تتحرك الملكة مثل الحصان وتستطيع القفز فوق القطع.') },
      { topic: text('Blocking pieces', 'Les pièces qui bloquent', 'القطع التي تعيق الحركة'), statement: text('The queen cannot pass through any piece on its path.', 'La dame ne peut traverser aucune pièce placée sur son trajet.', 'لا تستطيع الملكة المرور عبر أي قطعة تعترض طريقها.'), explanation: text('A friendly piece stops the queen before that square. An enemy piece may be captured only if it is the first occupied square along the chosen line.', 'Une pièce amie arrête la dame avant sa case. Une pièce adverse ne peut être capturée que si elle est la première pièce rencontrée sur la ligne.', 'توقف القطعة الصديقة الملكة قبل مربعها. ولا تُؤسر قطعة الخصم إلا إذا كانت أول قطعة على الخط المختار.'), misconception: text('The queen may jump over a pawn if the destination is empty.', 'La dame peut sauter un pion si la case d’arrivée est libre.', 'يمكن للملكة القفز فوق بيدق إذا كان مربع الوصول خالياً.') },
      { topic: text('Relative value', 'La valeur relative', 'القيمة النسبية'), statement: text('A queen is commonly valued at about nine pawns, but its real value depends on the position.', 'La dame vaut souvent environ neuf pions, mais sa valeur réelle dépend de la position.', 'تُقدّر الملكة غالباً بنحو تسعة بيادق، لكن قيمتها الحقيقية تعتمد على الوضع.'), explanation: text('Piece values are guides, not rules. A queen is powerful because it moves far in several directions, but a trapped or inactive queen may be less useful than coordinated pieces.', 'Les valeurs sont des repères, pas des règles. La dame est puissante grâce à sa portée, mais une dame enfermée peut être moins utile que des pièces bien coordonnées.', 'قيم القطع إرشادية وليست قواعد. قوة الملكة في مدى حركتها، لكن الملكة المحاصرة قد تقل فائدتها عن قطع منسّقة.'), misconception: text('A queen is always worth exactly nine points in every position.', 'La dame vaut toujours exactement neuf points dans toutes les positions.', 'تساوي الملكة دائماً تسع نقاط بالضبط في كل وضع.') },
      { topic: text('Queen safety', 'La sécurité de la dame', 'سلامة الملكة'), statement: text('Before moving the queen, check whether the opponent can attack it and gain a tempo.', 'Avant de déplacer la dame, vérifiez si l’adversaire peut l’attaquer en gagnant un tempo.', 'قبل تحريك الملكة، افحص ما إذا كان الخصم يستطيع مهاجمتها وكسب نقلة.'), explanation: text('A tempo is a useful unit of time in chess: forcing the queen to move repeatedly can help the opponent develop pieces. Calculate forcing replies before choosing an attractive queen move.', 'Un tempo est une unité de temps utile aux échecs : forcer la dame à bouger plusieurs fois peut aider l’adversaire à développer ses pièces. Calculez ses réponses forcées.', 'النقلة (tempo) وحدة زمنية مفيدة في الشطرنج؛ إجبار الملكة على التحرك مراراً قد يساعد الخصم على التطوير. احسب الردود الإجبارية قبل اختيار نقلة جذابة.'), misconception: text('A queen cannot be attacked by a lower-valued piece.', 'Une pièce de moindre valeur ne peut pas attaquer la dame.', 'لا تستطيع القطع الأقل قيمة مهاجمة الملكة.') },
      { topic: text('Queen coordination', 'La coordination de la dame', 'تنسيق الملكة'), statement: text('The queen is most effective when it works with other pieces rather than attacking alone.', 'La dame est plus efficace lorsqu’elle coopère avec les autres pièces au lieu d’attaquer seule.', 'تكون الملكة أكثر فاعلية عندما تنسق مع القطع الأخرى بدلاً من الهجوم وحدها.'), explanation: text('A supported queen can create threats on several lines. Bring minor pieces into play first so the queen has safe squares and targets to combine against.', 'Une dame soutenue peut créer des menaces sur plusieurs lignes. Développez d’abord les pièces mineures pour lui offrir des cases sûres et des cibles communes.', 'تستطيع الملكة المدعومة صنع تهديدات على عدة خطوط. طوّر القطع الصغيرة أولاً لتجد الملكة مربعات آمنة وأهدافاً مشتركة.'), misconception: text('The queen should attack immediately without support from other pieces.', 'La dame doit attaquer immédiatement sans soutien des autres pièces.', 'ينبغي للملكة الهجوم فوراً دون دعم القطع الأخرى.') },
    ],
    fen: '7k/8/8/8/8/8/8/3QK3 w - - 0 1',
    bestMove: 'Qh5+',
    annotation: text('Qh5+ demonstrates the queen’s diagonal movement followed by a check along the h-file.', 'Qh5+ montre le déplacement diagonal de la dame, qui donne ensuite échec sur la colonne h.', 'تُظهر Qh5+ الحركة القطرية للملكة ثم الكش على عمود h.'),
  },
  {
    id: 'l1-05',
    title: text('The Rook: Movement and Strategies', 'La tour : déplacements et stratégies', 'الرخ: الحركة والاستراتيجيات'),
    summary: text('Understand rook lines, open files, and why rooks become powerful when connected.', 'Comprenez les lignes de la tour, les colonnes ouvertes et la coordination des tours.', 'افهم خطوط الرخ والأعمدة المفتوحة وقوة تنسيق الرخين.'),
    facts: [
      { topic: text('Rook movement', 'Le déplacement de la tour', 'حركة الرخ'), statement: text('A rook moves any number of unobstructed squares along a rank or file.', 'La tour se déplace d’autant de cases libres qu’elle le souhaite sur une rangée ou une colonne.', 'يتحرك الرخ أي عدد من المربعات الخالية أفقياً أو عمودياً.'), explanation: text('The rook does not move diagonally and cannot jump. It may capture an enemy piece on its line if no piece blocks the route first.', 'La tour ne se déplace pas en diagonale et ne saute pas. Elle peut capturer une pièce adverse sur sa ligne si aucune pièce ne bloque le passage.', 'لا يتحرك الرخ قطرياً ولا يقفز. يمكنه أسر قطعة على خطه إذا لم تعترضه قطعة أخرى.'), misconception: text('A rook moves diagonally and can jump over a piece.', 'La tour se déplace en diagonale et peut sauter par-dessus une pièce.', 'يتحرك الرخ قطرياً ويستطيع القفز فوق قطعة.') },
      { topic: text('Open files', 'Les colonnes ouvertes', 'الأعمدة المفتوحة'), statement: text('An open file has no pawns on it and can be a useful route for a rook.', 'Une colonne ouverte ne contient aucun pion et peut offrir une voie utile à la tour.', 'العمود المفتوح لا يحتوي على بيادق وقد يوفر طريقاً مفيداً للرخ.'), explanation: text('A rook on an open file can pressure squares and targets along that file. A half-open file has no friendly pawn but may still contain an enemy pawn.', 'Une tour sur une colonne ouverte peut exercer une pression le long de celle-ci. Une colonne semi-ouverte ne contient pas de pion ami, mais peut contenir un pion adverse.', 'يستطيع الرخ على العمود المفتوح الضغط على أهدافه. أما العمود شبه المفتوح فيخلو من بيدقك لكنه قد يحتوي بيدق الخصم.'), misconception: text('A file is open whenever it contains no rooks.', 'Une colonne est ouverte dès qu’elle ne contient aucune tour.', 'يكون العمود مفتوحاً كلما خلا من الرخاخ.') },
      { topic: text('Relative value', 'La valeur relative', 'القيمة النسبية'), statement: text('A rook is commonly valued at about five pawns, although its activity can change its practical value.', 'La tour vaut souvent environ cinq pions, mais son activité modifie sa valeur pratique.', 'تُقدّر قيمة الرخ غالباً بنحو خمسة بيادق، لكن نشاطه يؤثر في قيمته العملية.'), explanation: text('A rook often becomes stronger when files open and passed pawns appear. Do not trade a rook only by counting points; compare activity, king safety, and targets.', 'La tour devient souvent plus forte lorsque les colonnes s’ouvrent et que des pions passés apparaissent. Évaluez aussi son activité, la sécurité des rois et les cibles.', 'غالباً ما يقوى الرخ عند انفتاح الأعمدة وظهور البيادق المارة. لا تقيّم التبديل بالنقاط وحدها؛ قارن النشاط وأمان الملك والأهداف.'), misconception: text('A rook is worth three pawns in every position.', 'La tour vaut trois pions dans toutes les positions.', 'تساوي قيمة الرخ ثلاثة بيادق في كل وضع.') },
      { topic: text('Connected rooks', 'Les tours reliées', 'الرخان المتصلان'), statement: text('Rooks are connected when no pieces remain between them on their shared rank or file.', 'Les tours sont reliées lorsqu’aucune pièce ne se trouve entre elles sur leur rangée ou colonne commune.', 'يكون الرخان متصلين عندما لا توجد قطع بينهما على الصف أو العمود المشترك.'), explanation: text('Connected rooks can defend one another and coordinate against a file or target. Castling and developing the minor pieces often help clear the back rank.', 'Des tours reliées se défendent et peuvent coordonner leurs attaques. Le roque et le développement des pièces mineures aident souvent à libérer la première rangée.', 'يدافع الرخان المتصلان أحدهما عن الآخر وينسّقان الهجوم على عمود أو هدف. يساعد التبييت وتطوير القطع الصغيرة على إخلاء الصف الخلفي.'), misconception: text('Rooks are connected whenever they are on different files.', 'Les tours sont reliées dès qu’elles se trouvent sur des colonnes différentes.', 'يكون الرخان متصلين بمجرد وجودهما على عمودين مختلفين.') },
      { topic: text('Rook activity', 'L’activité de la tour', 'نشاط الرخ'), statement: text('A rook is often more active behind a passed pawn, where it can support its advance or attack it.', 'Une tour est souvent active derrière un pion passé, qu’elle peut soutenir ou attaquer.', 'يكون الرخ نشطاً غالباً خلف البيدق المار، فيدعمه أو يهاجمه.'), explanation: text('The “behind the passed pawn” rule is a useful guideline, not an absolute law. Check whether the rook can reach the file, protect the king, and create threats before committing.', 'La règle « derrière le pion passé » est un bon principe, pas une loi absolue. Vérifiez l’accès à la colonne, la sécurité du roi et les menaces possibles.', 'قاعدة «الرخ خلف البيدق المار» إرشاد وليست قانوناً مطلقاً. افحص إمكانية الوصول إلى العمود وأمان الملك والتهديدات قبل الالتزام.'), misconception: text('A rook should always stand in front of its own passed pawn.', 'Une tour doit toujours se placer devant son propre pion passé.', 'ينبغي للرخ دائماً الوقوف أمام بيدقه المار.') },
    ],
    fen: '7k/8/8/8/8/8/8/R3K3 w - - 0 1',
    bestMove: 'Ra8+',
    annotation: text('Ra8+ travels along an open file and checks the king across the eighth rank.', 'Ra8+ suit une colonne ouverte et met le roi en échec sur la huitième rangée.', 'تتحرك Ra8+ على عمود مفتوح وتكش الملك عبر الصف الثامن.'),
  },
  {
    id: 'l1-06',
    title: text('The Bishop: Movement and Diagonals', 'Le fou : déplacements et diagonales', 'الفيل: الحركة والأقطار'),
    summary: text('Use diagonals, understand bishop color, and recognize the impact of pawn structure.', 'Utilisez les diagonales, comprenez la couleur du fou et observez la structure de pions.', 'استخدم الأقطار وافهم لون الفيل وتأثير بنية البيادق.'),
    facts: [
      { topic: text('Bishop movement', 'Le déplacement du fou', 'حركة الفيل'), statement: text('A bishop moves any number of unobstructed squares diagonally.', 'Le fou se déplace d’autant de cases libres qu’il le souhaite en diagonale.', 'يتحرك الفيل أي عدد من المربعات الخالية قطرياً.'), explanation: text('A bishop cannot move horizontally or vertically, and it cannot jump over another piece. A capture is made by landing on an enemy piece at the end of a clear diagonal.', 'Le fou ne se déplace ni horizontalement ni verticalement et ne saute pas. Il capture en terminant sa diagonale libre sur une pièce adverse.', 'لا يتحرك الفيل أفقياً أو عمودياً ولا يقفز فوق القطع. يأسر بإنهاء قطر خالٍ على قطعة للخصم.'), misconception: text('A bishop moves in straight lines along ranks and files.', 'Le fou se déplace en ligne droite sur les rangées et colonnes.', 'يتحرك الفيل بخطوط مستقيمة أفقية وعمودية.') },
      { topic: text('Square color', 'La couleur des cases', 'لون المربعات'), statement: text('A bishop remains on the same color squares throughout the game.', 'Un fou reste sur des cases de la même couleur pendant toute la partie.', 'يبقى الفيل على مربعات اللون نفسه طوال المباراة.'), explanation: text('A bishop that starts on a light square can never control a dark square directly. This makes the other bishop valuable for covering the opposite color complex.', 'Un fou qui commence sur une case claire ne contrôle jamais directement les cases foncées. L’autre fou peut couvrir l’autre couleur.', 'الفيل الذي يبدأ على مربع فاتح لا يسيطر مباشرة على المربعات الداكنة. لذلك يفيد الفيل الآخر في تغطية اللون المقابل.'), misconception: text('A bishop can switch square colors after moving two squares.', 'Le fou peut changer de couleur de cases après un déplacement de deux cases.', 'يستطيع الفيل تبديل لون المربعات بعد التحرك مربعين.') },
      { topic: text('The bishop pair', 'La paire de fous', 'زوج الفيلين'), statement: text('Having both bishops gives a player a bishop pair that can influence both square colors.', 'Posséder les deux fous permet d’influencer les cases des deux couleurs.', 'امتلاك الفيلين يتيح التأثير في مربعات اللونين.'), explanation: text('The bishop pair can be especially useful in open positions, where long diagonals are clear. It is an advantage to evaluate, not an automatic win or a reason to ignore king safety.', 'La paire de fous est souvent utile dans les positions ouvertes où les grandes diagonales sont libres. C’est un avantage à évaluer, pas une victoire automatique.', 'قد يكون زوج الفيلين مفيداً في المراكز المفتوحة ذات الأقطار الطويلة. إنها ميزة تُقيّم وليست فوزاً تلقائياً أو سبباً لإهمال أمان الملك.'), misconception: text('A bishop pair guarantees checkmate regardless of the position.', 'La paire de fous garantit le mat quelle que soit la position.', 'يضمن زوج الفيلين كش مات مهما كان الوضع.') },
      { topic: text('Pawn structure and bishops', 'La structure de pions et les fous', 'بنية البيادق والفيلان'), statement: text('A bishop’s activity depends on whether its own pawns block its diagonals.', 'L’activité d’un fou dépend du blocage ou non de ses diagonales par ses propres pions.', 'يعتمد نشاط الفيل على ما إذا كانت بيادق صاحبه تعيق أقطاره.'), explanation: text('A bishop behind a fixed chain of same-color pawns may have limited routes. Open a diagonal with a thoughtful pawn move, or improve another piece before changing the structure.', 'Un fou enfermé derrière une chaîne de pions fixes peut manquer de routes. Ouvrez une diagonale avec un coup de pion réfléchi ou améliorez une autre pièce.', 'قد تقل مسارات الفيل خلف سلسلة بيادق ثابتة. افتح قطراً بنقلة بيدق مدروسة أو حسّن قطعة أخرى قبل تغيير البنية.'), misconception: text('A bishop is always active even when its own pawns block every diagonal.', 'Un fou est toujours actif même si ses propres pions bloquent toutes ses diagonales.', 'يكون الفيل نشطاً دائماً حتى لو سدت بيادق صاحبه أقطاره كلها.') },
      { topic: text('Bishop lines', 'Les lignes du fou', 'خطوط الفيل'), statement: text('A bishop’s long diagonal can pressure a target from a distance when the path is clear.', 'Une longue diagonale permet au fou de mettre une cible sous pression à distance si la ligne est libre.', 'يمكن لقطر طويل أن يمكّن الفيل من الضغط على هدف بعيد إذا كان الطريق خالياً.'), explanation: text('A bishop may attack a square without moving closer to it. Before opening a diagonal, verify that your own king and valuable pieces will not become exposed.', 'Le fou peut attaquer une case sans s’en approcher. Avant d’ouvrir une diagonale, vérifiez que votre roi et vos pièces importantes restent protégés.', 'قد يهاجم الفيل مربعاً من بعيد. قبل فتح القطر، تأكد من عدم كشف ملكك أو قطعك المهمة.'), misconception: text('A bishop attacks only the next square on its diagonal.', 'Le fou n’attaque que la case suivante sur sa diagonale.', 'يهاجم الفيل المربع التالي فقط على قطره.') },
    ],
    fen: '7k/8/8/8/8/8/8/2B1K3 w - - 0 1',
    bestMove: 'Bf4',
    annotation: text('Bf4 follows a clear diagonal from c1 to f4, illustrating the bishop’s movement.', 'Bf4 suit une diagonale libre de c1 à f4 et illustre le déplacement du fou.', 'تتبع Bf4 قطراً خالياً من c1 إلى f4، موضحةً حركة الفيل.'),
  },
  {
    id: 'l1-07',
    title: text('The Knight: Movement and Special Patterns', 'Le cavalier : déplacements et motifs particuliers', 'الحصان: الحركة والأنماط الخاصة'),
    summary: text('Master the knight’s L-shaped move, jumping ability, and changing square colors.', 'Maîtrisez le déplacement en L du cavalier, sa capacité à sauter et l’alternance de couleur des cases.', 'أتقن حركة الحصان على شكل L وقدرته على القفز وتبدّل لون مربعاته.'),
    facts: [
      { topic: text('The L-shape', 'Le déplacement en L', 'حركة L'), statement: text('A knight moves two squares in one direction and then one square perpendicular to that direction.', 'Le cavalier avance de deux cases dans une direction, puis d’une case perpendiculairement.', 'يتحرك الحصان مربعين في اتجاه ثم مربعاً واحداً عمودياً على ذلك الاتجاه.'), explanation: text('The destination forms an L. From a central square on an empty board, a knight can have up to eight destinations; near an edge, fewer are available.', 'La destination forme un L. Depuis le centre d’un échiquier vide, le cavalier peut avoir jusqu’à huit destinations ; près du bord, il en a moins.', 'يشكل مربع الوصول حرف L. من مربع مركزي على رقعة خالية قد يملك الحصان ثماني وجهات، وتقل قرب الحافة.'), misconception: text('A knight moves exactly two squares in a straight line.', 'Le cavalier se déplace exactement de deux cases en ligne droite.', 'يتحرك الحصان مربعين بالضبط في خط مستقيم.') },
      { topic: text('Jumping', 'Le saut', 'القفز'), statement: text('A knight is the only standard chess piece that can jump over intervening pieces.', 'Le cavalier est la seule pièce habituelle qui peut sauter par-dessus les pièces intermédiaires.', 'الحصان هو القطعة الوحيدة في الشطرنج التي تستطيع القفز فوق القطع.'), explanation: text('Its move is determined by the destination square, not by whether the path is occupied. It still cannot land on a square occupied by a friendly piece.', 'Son coup dépend de la case d’arrivée, pas des pièces traversées. Il ne peut toutefois pas arriver sur une pièce amie.', 'تعتمد نقلته على مربع الوصول لا على القطع التي يمر فوقها، لكنه لا يستطيع الوصول إلى مربع تشغله قطعة صديقة.'), misconception: text('A knight may capture a friendly piece on its destination square.', 'Le cavalier peut capturer une pièce amie sur sa case d’arrivée.', 'يستطيع الحصان أسر قطعة صديقة في مربع الوصول.') },
      { topic: text('Square colors', 'La couleur des cases', 'ألوان المربعات'), statement: text('Every knight move changes the color of the square the knight occupies.', 'Chaque coup de cavalier change la couleur de la case qu’il occupe.', 'تغيّر كل نقلة للحصان لون المربع الذي يقف عليه.'), explanation: text('An L-shaped move always travels from a light square to a dark square or the reverse. This alternation is useful when checking a knight route.', 'Un déplacement en L mène toujours d’une case claire à une case foncée ou inversement. Cette alternance aide à vérifier un trajet.', 'تنقل حركة L الحصان دائماً من مربع فاتح إلى داكن أو العكس. يفيد هذا التناوب في فحص مسار الحصان.'), misconception: text('A knight returns to the same square color after every move.', 'Le cavalier revient sur une case de même couleur après chaque coup.', 'يصل الحصان إلى مربع اللون نفسه بعد كل نقلة.') },
      { topic: text('Knight routes', 'Les trajets du cavalier', 'مسارات الحصان'), statement: text('A knight often needs several moves to reach a distant target because it cannot travel in a straight line.', 'Le cavalier a souvent besoin de plusieurs coups pour atteindre une cible éloignée, car il ne se déplace pas en ligne droite.', 'يحتاج الحصان غالباً إلى عدة نقلات للوصول إلى هدف بعيد لأنه لا يتحرك بخط مستقيم.'), explanation: text('Plan a route through safe squares. A knight near the rim can be short of useful destinations, while a central post may give it influence over many squares.', 'Planifiez un trajet par des cases sûres. Un cavalier en bordure a peu de destinations utiles, tandis qu’un avant-poste central peut contrôler de nombreuses cases.', 'خطط لمسار عبر مربعات آمنة. تقل وجهات الحصان عند الحافة، وقد يمنحه موقع مركزي تأثيراً على مربعات كثيرة.'), misconception: text('A knight on the rim controls more squares than a central knight.', 'Un cavalier au bord contrôle plus de cases qu’un cavalier central.', 'يسيطر الحصان على الحافة على مربعات أكثر من حصان الوسط.') },
      { topic: text('Knight forks', 'Les fourchettes de cavalier', 'شوكة الحصان'), statement: text('A knight can attack several targets at once, creating a fork or double attack.', 'Le cavalier peut attaquer plusieurs cibles à la fois et créer une fourchette.', 'يستطيع الحصان مهاجمة عدة أهداف معاً وصنع شوكة أو هجوم مزدوج.'), explanation: text('Because a knight’s attack cannot be blocked, a fork may threaten a king and another piece simultaneously. Look for checks first, then identify the second target.', 'Comme son attaque ne peut pas être bloquée, une fourchette peut menacer simultanément le roi et une autre pièce. Cherchez d’abord les échecs, puis une seconde cible.', 'لأن هجوم الحصان لا يُصد بقطعة، قد تهدد الشوكة الملك وقطعة أخرى معاً. ابحث عن الكش أولاً ثم عن الهدف الثاني.'), misconception: text('A knight’s fork can always be stopped by placing a piece between the knight and its target.', 'On peut toujours arrêter une fourchette de cavalier en plaçant une pièce entre le cavalier et sa cible.', 'يمكن دائماً صد شوكة الحصان بوضع قطعة بين الحصان والهدف.') },
    ],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    bestMove: 'Nf3',
    annotation: text('Nf3 is the knight’s L-shaped move from g1 to f3; the e2 pawn does not block the jump.', 'Nf3 est le déplacement en L du cavalier de g1 à f3 ; le pion e2 ne bloque pas son saut.', 'Nf3 نقلة L للحصان من g1 إلى f3؛ لا يعيق بيدق e2 قفزته.'),
  },
  {
    id: 'l1-08',
    title: text('The Pawn: Movement, Captures and Promotion', 'Le pion : déplacement, prise et promotion', 'البيدق: الحركة والأسر والترقية'),
    summary: text('Learn the pawn’s forward movement, diagonal captures, promotion, and en passant.', 'Apprenez l’avance du pion, ses prises en diagonale, la promotion et la prise en passant.', 'تعلّم تقدم البيدق وأسره قطرياً وترقيته والأخذ بالتجاوز.'),
    facts: [
      { topic: text('Forward movement', 'L’avance', 'التقدم'), statement: text('A pawn normally moves one square forward into an empty square.', 'Un pion avance normalement d’une case vers l’avant sur une case vide.', 'يتقدم البيدق عادةً مربعاً واحداً إلى الأمام نحو مربع فارغ.'), explanation: text('Pawns do not move backward. White advances toward rank 8 and Black toward rank 1. A pawn cannot move forward into an occupied square.', 'Les pions ne reculent pas. Les Blancs avancent vers la rangée 8 et les Noirs vers la rangée 1. Un pion ne peut pas avancer sur une case occupée.', 'لا تتراجع البيادق. يتقدم الأبيض نحو الصف 8 والأسود نحو الصف 1، ولا يستطيع البيدق التقدم إلى مربع مشغول.'), misconception: text('A pawn captures by moving straight forward one square.', 'Un pion capture en avançant tout droit d’une case.', 'يأسر البيدق بتحركه مربعاً إلى الأمام مباشرة.') },
      { topic: text('First double step', 'La double avance initiale', 'التقدم المزدوج الأول'), statement: text('From its starting rank, a pawn may advance two squares if both squares are clear.', 'Depuis sa rangée de départ, un pion peut avancer de deux cases si les deux sont libres.', 'من صف البداية، يمكن للبيدق التقدم مربعين إذا كان كلاهما خالياً.'), explanation: text('The two-square move is optional, not mandatory. A pawn can make it only from its starting square and cannot jump over a piece on the intermediate square.', 'La double avance est facultative. Elle n’est possible que depuis la case de départ et le pion ne peut pas sauter une pièce intermédiaire.', 'التقدم مربعين اختياري وليس إلزامياً. لا يحدث إلا من مربع البداية ولا يقفز البيدق فوق قطعة في المربع الوسيط.'), misconception: text('A pawn may move two squares from any square whenever the path is clear.', 'Un pion peut avancer de deux cases depuis n’importe quelle case si le chemin est libre.', 'يستطيع البيدق التقدم مربعين من أي مربع متى كان الطريق خالياً.') },
      { topic: text('Captures', 'Les prises', 'الأسر'), statement: text('A pawn captures one square diagonally forward, not straight ahead.', 'Un pion capture une case en diagonale vers l’avant, jamais tout droit.', 'يأسر البيدق مربعاً واحداً قطرياً إلى الأمام وليس مباشرة.'), explanation: text('A pawn moves and captures differently: forward for a quiet move, diagonal for a capture. It cannot capture a piece behind it or on an adjacent file without moving forward.', 'Le pion se déplace et capture différemment : tout droit pour avancer, en diagonale pour prendre. Il ne capture ni derrière lui ni horizontalement.', 'تختلف حركة البيدق عن أسره: يتقدم مباشرة ويأسر قطرياً. لا يأسر خلفه أو أفقياً إلى مربع مجاور.'), misconception: text('A pawn captures a piece directly in front of it.', 'Un pion capture une pièce située directement devant lui.', 'يأسر البيدق القطعة الموجودة أمامه مباشرة.') },
      { topic: text('Promotion', 'La promotion', 'الترقية'), statement: text('When a pawn reaches the last rank, it must promote to a queen, rook, bishop, or knight.', 'Lorsqu’un pion atteint la dernière rangée, il doit être promu en dame, tour, fou ou cavalier.', 'عندما يصل البيدق إلى الصف الأخير، يجب ترقيته إلى ملكة أو رخ أو فيل أو حصان.'), explanation: text('Promotion happens immediately on reaching the last rank. A pawn cannot become a king, and choosing a piece other than a queen is called underpromotion.', 'La promotion a lieu dès l’arrivée sur la dernière rangée. Le pion ne peut pas devenir roi ; choisir une pièce autre que la dame est une sous-promotion.', 'تحدث الترقية فور الوصول إلى الصف الأخير. لا يتحول البيدق إلى ملك، واختيار قطعة غير الملكة يسمى ترقية ناقصة.'), misconception: text('A pawn may promote only to a queen and only if a queen has already been captured.', 'Un pion ne peut devenir qu’une dame, et seulement si une dame a déjà été capturée.', 'لا يترقى البيدق إلا إلى ملكة وبعد أسر ملكة الخصم فقط.') },
      { topic: text('En passant', 'La prise en passant', 'الأخذ بالتجاوز'), statement: text('En passant is an immediate pawn capture after an opponent advances a pawn two squares past your pawn.', 'La prise en passant est une prise immédiate après qu’un pion adverse a avancé de deux cases au-delà du vôtre.', 'الأخذ بالتجاوز أسر فوري بعد أن يتقدم بيدق الخصم مربعين متجاوزاً بيدقك.'), explanation: text('The capturing pawn moves diagonally to the square the opposing pawn passed over, and the opposing pawn is removed. If you do not take en passant on the very next move, the right expires.', 'Le pion preneur avance en diagonale sur la case traversée et le pion adverse est retiré. Si la prise n’est pas jouée immédiatement, le droit disparaît.', 'يتحرك البيدق الآسر قطرياً إلى المربع الذي تجاوزه بيدق الخصم، ثم يُزال البيدق. إذا لم تنفذها فوراً، يسقط الحق بها.'), misconception: text('En passant can be played at any later time as long as the pawns remain adjacent.', 'La prise en passant peut être jouée plus tard tant que les pions restent voisins.', 'يمكن تنفيذ الأخذ بالتجاوز في أي وقت لاحق ما دام البيدقان متجاورين.') },
    ],
    fen: '7k/P7/8/8/8/8/8/7K w - - 0 1',
    bestMove: 'a8=Q+',
    annotation: text('a8=Q+ shows a pawn reaching the last rank and promoting; the resulting queen gives check.', 'a8=Q+ montre un pion qui atteint la dernière rangée et est promu ; la dame obtenue donne échec.', 'تُظهر a8=Q+ وصول البيدق إلى الصف الأخير وترقيته؛ ثم تكش الملكة الناتجة.'),
  },
  {
    id: 'l1-09',
    title: text('Understanding Check, Checkmate and Stalemate', 'Comprendre l’échec, le mat et le pat', 'فهم الكش وكش مات والجمود'),
    summary: text('Distinguish check, checkmate, and stalemate, and learn how to respond to threats against the king.', 'Distinguez l’échec, le mat et le pat, et apprenez à répondre aux menaces contre le roi.', 'ميّز بين الكش وكش مات والجمود وتعلّم الرد على تهديدات الملك.'),
    facts: [
      { topic: text('Check', 'L’échec', 'الكش'), statement: text('A king is in check when an opposing piece attacks its square.', 'Un roi est en échec lorsqu’une pièce adverse attaque sa case.', 'يكون الملك في كش عندما تهاجم قطعة للخصم مربعه.'), explanation: text('Check must be answered on the very next move. A player may not leave their king in check or make a move that exposes it to check.', 'Il faut parer l’échec au coup suivant. On ne peut pas laisser son roi en échec ni jouer un coup qui l’y expose.', 'يجب الرد على الكش في النقلة التالية. لا يجوز ترك الملك في كش أو تنفيذ نقلة تكشفه له.'), misconception: text('Check is optional to answer if the player can capture another piece.', 'Il est facultatif de parer l’échec si l’on peut capturer une autre pièce.', 'الرد على الكش اختياري إذا استطاع اللاعب أسر قطعة أخرى.') },
      { topic: text('Checkmate', 'L’échec et mat', 'كش مات'), statement: text('Checkmate occurs when the king is in check and no legal move can remove the threat.', 'Il y a échec et mat lorsque le roi est en échec et qu’aucun coup légal ne peut parer la menace.', 'يحدث كش مات عندما يكون الملك في كش ولا توجد نقلة قانونية تزيل التهديد.'), explanation: text('Test every possible defense: king moves, captures of the checking piece, and blocks against sliding attacks. If none work, the game ends immediately with a win for the attacker.', 'Vérifiez les déplacements du roi, la capture de l’attaquant et la parade d’une attaque à distance. Si aucune défense ne fonctionne, la partie se termine par une victoire.', 'افحص تحركات الملك وأسر القطعة المهاجمة وصد الهجوم الخطي. إن لم تنجح أي وسيلة، تنتهي المباراة بفوز المهاجم.'), misconception: text('Checkmate means the king is attacked but may still escape on the next turn.', 'Le mat signifie que le roi est attaqué mais pourra fuir au prochain tour.', 'يعني كش مات أن الملك مهدد لكنه يستطيع الهرب في الدور التالي.') },
      { topic: text('Stalemate', 'Le pat', 'الجمود'), statement: text('Stalemate is a draw when the player to move is not in check but has no legal move.', 'Le pat est une partie nulle lorsque le joueur au trait n’est pas en échec mais n’a aucun coup légal.', 'الجمود تعادل عندما لا يكون اللاعب الذي عليه الدور في كش ولا يملك أي نقلة قانونية.'), explanation: text('Stalemate is not checkmate. A player who is ahead in material must avoid removing every legal move unless the king is actually checkmated.', 'Le pat n’est pas un échec et mat. Un joueur en avantage matériel doit éviter de supprimer tous les coups légaux si le roi n’est pas réellement mat.', 'الجمود ليس كش مات. على المتقدم مادياً تجنب سلب الخصم كل النقلات القانونية ما لم يكن ملكه في كش مات فعلياً.'), misconception: text('Stalemate is a win for the player who has more pieces.', 'Le pat est une victoire du joueur qui possède le plus de pièces.', 'الجمود فوز للاعب الذي يملك قطعاً أكثر.') },
      { topic: text('Three ways to answer check', 'Trois façons de parer l’échec', 'ثلاث وسائل للرد على الكش'), statement: text('A check may be answered by moving the king, capturing the attacker, or blocking a sliding attack when possible.', 'On peut parer l’échec en déplaçant le roi, en capturant l’attaquant ou en bloquant une attaque à distance si possible.', 'يمكن الرد على الكش بتحريك الملك أو أسر المهاجم أو صد الهجوم الخطي إن أمكن.'), explanation: text('Not every check permits all three defenses. A knight check cannot be blocked, and a double check normally requires moving the king. Analyze the actual geometry of the attack.', 'Toutes les défenses ne sont pas possibles contre chaque échec. On ne bloque pas un échec de cavalier et un double échec impose généralement de bouger le roi.', 'لا تتاح الوسائل الثلاث لكل كش. لا يمكن صد كش الحصان، والكش المزدوج يتطلب عادةً تحريك الملك. افحص شكل الهجوم.'), misconception: text('Every check can be blocked by placing any piece between attacker and king.', 'On peut parer tout échec en plaçant n’importe quelle pièce entre l’attaquant et le roi.', 'يمكن صد كل كش بوضع أي قطعة بين المهاجم والملك.') },
      { topic: text('Delivering mate', 'Donner échec et mat', 'تنفيذ كش مات'), statement: text('A mating move must attack the king and leave the opponent with no legal escape or defense.', 'Un coup de mat doit attaquer le roi et ne laisser aucune fuite ni défense légale.', 'يجب أن تهاجم نقلة المات الملك وألا تترك للخصم مهرباً أو دفاعاً قانونياً.'), explanation: text('Before announcing mate, check captures, king escapes, and blocks. A move that merely attacks the king is check, not mate, if even one legal defense remains.', 'Avant d’annoncer le mat, vérifiez les captures, les fuites du roi et les parades. S’il reste une seule défense légale, il s’agit seulement d’un échec.', 'قبل إعلان المات، افحص الأسر وهروب الملك والصد. إذا بقي دفاع قانوني واحد، فهذه نقلة كش وليست مات.'), misconception: text('Any attack that gives check is automatically checkmate.', 'Toute attaque qui donne échec est automatiquement un mat.', 'كل هجوم يسبب كش هو كش مات تلقائياً.') },
    ],
    fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
    bestMove: 'Qg7#',
    annotation: text('Qg7# is checkmate: the queen checks the king and the white king protects the queen’s mating square.', 'Qg7# est mat : la dame attaque le roi et le roi blanc protège la case de mat.', 'Qg7# كش مات: تهاجم الملكة الملك ويحمي الملك الأبيض مربع المات.' ),
  },
  {
    id: 'l1-10',
    title: text('Castling, En Passant and Special Rules', 'Le roque, la prise en passant et les règles spéciales', 'التبييت والأخذ بالتجاوز والقواعد الخاصة'),
    summary: text('Apply castling and en passant correctly, and recognize when these special moves are legal.', 'Appliquez correctement le roque et la prise en passant, et vérifiez leur légalité.', 'طبّق التبييت والأخذ بالتجاوز بشكل صحيح وتحقق من قانونيتهما.'),
    facts: [
      { topic: text('Castling move', 'Le coup de roque', 'نقلة التبييت'), statement: text('Castling moves the king two squares toward a rook and moves that rook to the square next to the king.', 'Le roque déplace le roi de deux cases vers une tour, puis place la tour à côté du roi.', 'ينقل التبييت الملك مربعين نحو الرخ، ثم يضع الرخ في المربع المجاور للملك.'), explanation: text('Kingside castling is written O-O; queenside castling is O-O-O. It is the only move in which two of a player’s pieces move at once.', 'Le petit roque s’écrit O-O et le grand roque O-O-O. C’est le seul coup où deux pièces du même joueur bougent ensemble.', 'يُكتب التبييت القصير O-O والطويل O-O-O. وهي النقلة الوحيدة التي تتحرك فيها قطعتان للاعب نفسه معاً.'), misconception: text('Castling moves the rook two squares and leaves the king in place.', 'Le roque déplace la tour de deux cases et laisse le roi en place.', 'ينقل التبييت الرخ مربعين ويبقي الملك مكانه.') },
      { topic: text('Castling rights', 'Les droits au roque', 'حق التبييت'), statement: text('Neither the king nor the castling rook may have moved earlier in the game.', 'Ni le roi ni la tour concernée ne doivent avoir déjà bougé pendant la partie.', 'يجب ألا يكون الملك أو الرخ المستخدم قد تحرك سابقاً في المباراة.'), explanation: text('A piece that returns to its starting square does not regain castling rights. The squares between the king and rook must also be empty.', 'Une pièce qui revient à sa case de départ ne récupère pas son droit au roque. Les cases entre le roi et la tour doivent être libres.', 'إذا عاد الملك أو الرخ إلى مربعه الأول فلا يستعيد حق التبييت. كما يجب أن تكون المربعات بينهما خالية.'), misconception: text('A king may castle after moving away and returning to its original square.', 'Le roi peut roquer après avoir quitté puis retrouvé sa case initiale.', 'يستطيع الملك التبييت بعد مغادرة مربعه والعودة إليه.') },
      { topic: text('Castling through check', 'Le roque en passant par l’échec', 'التبييت عبر الكش'), statement: text('A player cannot castle while in check or if the king crosses or lands on an attacked square.', 'On ne peut pas roquer si le roi est en échec, traverse une case attaquée ou arrive sur une case attaquée.', 'لا يجوز التبييت إذا كان الملك في كش أو عبر مربعاً مهدداً أو وصل إلى مربع مهدد.'), explanation: text('The rook’s path may cross an attacked square; the restriction concerns the king’s starting, transit, and destination squares. Check all three before castling.', 'La tour peut traverser une case attaquée ; la restriction concerne les cases de départ, de passage et d’arrivée du roi. Vérifiez-les toutes.', 'قد يمر الرخ بمربع مهدد؛ لكن الشرط يتعلق بمربعات بداية الملك وعبوره ووصوله. افحصها جميعاً قبل التبييت.'), misconception: text('Castling is legal through check as long as the king’s final square is safe.', 'Le roque est permis en traversant l’échec si la case finale du roi est sûre.', 'يصح التبييت عبر الكش ما دام مربع الملك الأخير آمناً.') },
      { topic: text('En passant timing', 'Le moment de la prise en passant', 'توقيت الأخذ بالتجاوز'), statement: text('En passant is legal only on the move immediately after the opposing pawn advances two squares.', 'La prise en passant n’est légale qu’immédiatement après la double avance du pion adverse.', 'يصح الأخذ بالتجاوز فقط في النقلة التي تلي مباشرة تقدم بيدق الخصم مربعين.'), explanation: text('The right is temporary and disappears if another move is played. The capturing pawn moves diagonally to the passed-over square and removes the advanced pawn.', 'Ce droit est temporaire et disparaît si un autre coup est joué. Le pion preneur va sur la case traversée et retire le pion adverse.', 'هذا الحق مؤقت ويسقط إذا لُعبت نقلة أخرى. ينتقل البيدق الآسر إلى المربع المتجاوز ويزيل بيدق الخصم.'), misconception: text('En passant remains legal for the rest of the game after the two-square pawn move.', 'La prise en passant reste possible jusqu’à la fin de la partie après la double avance.', 'يبقى الأخذ بالتجاوز قانونياً حتى نهاية المباراة بعد حركة البيدق المزدوجة.') },
      { topic: text('Promotion choice', 'Le choix de promotion', 'اختيار الترقية'), statement: text('A promoting pawn may become a queen, rook, bishop, or knight, even if that piece is still on the board.', 'Un pion promu peut devenir dame, tour, fou ou cavalier, même si cette pièce est encore sur l’échiquier.', 'يمكن ترقية البيدق إلى ملكة أو رخ أو فيل أو حصان حتى لو كانت قطعة من النوع نفسه ما زالت على الرقعة.'), explanation: text('Promotion is not limited by captured pieces. A knight promotion may be useful to give a check or avoid stalemate; choose the piece that best fits the position.', 'La promotion ne dépend pas des pièces capturées. Un cavalier peut être utile pour donner échec ou éviter le pat ; choisissez selon la position.', 'لا تعتمد الترقية على القطع المأسورة. قد يفيد الحصان لإعطاء كش أو تجنب الجمود؛ اختر القطعة الأنسب للموقف.'), misconception: text('You may promote only to a piece that has already been captured.', 'On ne peut promouvoir qu’en une pièce déjà capturée.', 'لا تجوز الترقية إلا إلى قطعة أُسرت سابقاً.') },
    ],
    fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
    bestMove: 'O-O',
    annotation: text('O-O is legal here: the king and rook have not moved, the path is clear, and the king does not cross an attacked square.', 'O-O est légal ici : le roi et la tour n’ont pas bougé, le chemin est libre et le roi ne traverse aucune case attaquée.', 'O-O قانونية هنا: لم يتحرك الملك أو الرخ، والطريق خالٍ، ولا يعبر الملك مربعاً مهدداً.'),
  },
];

const quizText = {
  en: {
    easy: (topic: string) => `Which statement correctly describes ${topic}?`,
    medium: (topic: string) => `You are teaching a beginner about ${topic}. Which rule should they apply?`,
    trueFalse: 'True or false: ',
    mistake: (claim: string) => `A student claims: “${claim}” Is the claim correct?`,
    move: (topic: string) => `On the board, make a legal move that demonstrates ${topic}.`,
    true: 'True',
    false: 'False',
    answer: 'Review the rule and compare it with the position.',
  },
  fr: {
    easy: (topic: string) => `Quelle affirmation décrit correctement ${topic} ?`,
    medium: (topic: string) => `Vous expliquez ${topic} à un débutant. Quelle règle doit-il appliquer ?`,
    trueFalse: 'Vrai ou faux : ',
    mistake: (claim: string) => `Un élève affirme : « ${claim} » Cette affirmation est-elle correcte ?`,
    move: (topic: string) => `Sur l’échiquier, jouez un coup légal qui illustre ${topic}.`,
    true: 'Vrai',
    false: 'Faux',
    answer: 'Relisez la règle et comparez-la à la position.',
  },
  ar: {
    easy: (topic: string) => `أي عبارة تصف ${topic} بشكل صحيح؟`,
    medium: (topic: string) => `تشرح ${topic} لمبتدئ. ما القاعدة التي ينبغي تطبيقها؟`,
    trueFalse: 'صح أم خطأ: ',
    mistake: (claim: string) => `يقول طالب: «${claim}» هل قوله صحيح؟`,
    move: (topic: string) => `نفّذ على الرقعة نقلة قانونية توضح ${topic}.`,
    true: 'صح',
    false: 'خطأ',
    answer: 'راجع القاعدة وقارنها بالوضع على الرقعة.',
  },
} as const;

const difficultyByVariant = ['easy', 'medium', 'medium', 'hard'] as const;
const typeByVariant = ['multiple_choice', 'multiple_choice', 'true_false', 'identify_mistake'] as const;

export const LEVEL1_LESSONS: AcademyLessonContent[] = lessonSeeds.map((seed, lessonIndex) => {
  const facts = seed.facts;
  const lessonId = seed.id;
  return {
    id: lessonId,
    levelNumber: 1,
    lessonNumber: lessonIndex + 1,
    title: seed.title,
    summary: seed.summary,
    objectives: facts.map((fact) => fact.topic),
    sections: facts.map((fact) => ({
      title: fact.topic,
      paragraphs: [
        fact.statement,
        fact.explanation,
        text(
          `Practice checkpoint: identify ${fact.topic.en} on a board, explain the rule, and check how the opponent could respond.`,
          `Mise en pratique : repérez ${fact.topic.fr} sur un échiquier, expliquez la règle et vérifiez la réponse possible de l’adversaire.`,
          `تطبيق عملي: حدّد ${fact.topic.ar} على الرقعة، واشرح القاعدة، ثم تحقّق من رد الخصم الممكن.`
        ),
      ],
    })),
    terminology: facts.map((fact) => ({ term: fact.topic, definition: fact.statement })),
    example: { fen: seed.fen, solutionMoves: [seed.bestMove], annotation: seed.annotation },
    commonMistakes: facts.map((fact) => fact.misconception),
    professionalTips: facts.map((fact) => text(
      `Before moving, pause and ask how ${fact.topic.en} affects your king safety and your opponent’s best reply.`,
      `Avant de jouer, demandez-vous comment ${fact.topic.fr} influence la sécurité de votre roi et la meilleure réponse adverse.`,
      `قبل أن تلعب، فكّر كيف يؤثر ${fact.topic.ar} في أمان ملكك وفي أفضل رد للخصم.`
    )),
    exercises: facts.map((fact) => text(
      `Set up a position that demonstrates ${fact.topic.en}. Name the legal choices and explain why one choice follows the rule.`,
      `Préparez une position illustrant ${fact.topic.fr}. Indiquez les choix légaux et expliquez lequel respecte la règle.`,
      `أنشئ وضعية توضّح ${fact.topic.ar}. اذكر النقلات القانونية واشرح لماذا تتبع إحداها القاعدة.`
    )),
    takeaways: facts.map((fact) => fact.statement),
  };
});

function choicesWithCorrectAnswer(
  correctText: LocalizedText,
  otherTexts: LocalizedText[],
  correctIndex: number
): { choices: AcademyChoice[]; correctAnswer: string } {
  const labels = [correctText, ...otherTexts].slice(0, 4);
  const ordered: LocalizedText[] = [];
  for (let index = 0; index < 4; index += 1) {
    ordered.push(labels[(index - correctIndex + 4) % 4]);
  }
  const choices = ordered.map((label, index) => ({ id: String.fromCharCode(97 + index), label }));
  return { choices, correctAnswer: String.fromCharCode(97 + correctIndex) };
}

function legalMoveChoices(
  fen: string,
  bestMove: string,
  correctIndex: number
): { choices: AcademyChoice[]; correctAnswer: string } {
  const legalMoves = new Chess(fen).moves();
  if (!legalMoves.includes(bestMove)) {
    throw new Error(`Invalid Level 1 demonstration move: ${bestMove}`);
  }
  const moves = [bestMove, ...legalMoves.filter((move) => move !== bestMove).slice(0, 3)];
  const ordered = moves.map((_, index) => moves[(index - correctIndex + moves.length) % moves.length]);
  const choices = ordered.map((move) => ({
    id: move,
    label: text(move, move, move),
  }));
  return { choices, correctAnswer: bestMove };
}

export function getLevel1Lessons(): AcademyLessonContent[] {
  return LEVEL1_LESSONS;
}

export function getLevel1Lesson(lessonId: string): AcademyLessonContent | undefined {
  return LEVEL1_LESSONS.find((lesson) => lesson.id === lessonId);
}

export function getLevel1Quiz(lessonId: string): AcademyQuestion[] {
  const seed = lessonSeeds.find((lesson) => lesson.id === lessonId);
  if (!seed) return [];

  const questions: AcademyQuestion[] = [];
  seed.facts.forEach((fact, factIndex) => {
    for (let variant = 0; variant < 4; variant += 1) {
      const questionNumber = factIndex * 4 + variant + 1;
      const difficulty = difficultyByVariant[variant];
      let type: AcademyQuestion['type'] = typeByVariant[variant];
      let prompt: LocalizedText;
      let choices: AcademyChoice[];
      let correctAnswer: string;
      let explanation = fact.explanation;
      let fen: string | undefined;
      let solutionMoves: string[] | undefined;

      if (variant === 0 || variant === 1) {
        const otherFacts = seed.facts
          .filter((_, index) => index !== factIndex)
          .map((other) => other.statement);
        const distractors = [0, 1, 2].map((offset) => otherFacts[(factIndex + offset) % otherFacts.length]);
        const correctIndex = (lessonId.length + factIndex + variant) % 4;
        ({ choices, correctAnswer } = choicesWithCorrectAnswer(fact.statement, distractors, correctIndex));
        prompt = {
          en: quizText.en[variant === 0 ? 'easy' : 'medium'](fact.topic.en),
          fr: quizText.fr[variant === 0 ? 'easy' : 'medium'](fact.topic.fr),
          ar: quizText.ar[variant === 0 ? 'easy' : 'medium'](fact.topic.ar),
        };
      } else if (variant === 2) {
        type = 'true_false';
        prompt = {
          en: `${quizText.en.trueFalse}${fact.statement.en}`,
          fr: `${quizText.fr.trueFalse}${fact.statement.fr}`,
          ar: `${quizText.ar.trueFalse}${fact.statement.ar}`,
        };
        choices = [
          { id: 'true', label: text(quizText.en.true, quizText.fr.true, quizText.ar.true) },
          { id: 'false', label: text(quizText.en.false, quizText.fr.false, quizText.ar.false) },
        ];
        correctAnswer = 'true';
      } else if (factIndex === seed.facts.length - 1) {
        type = lessonId === 'l1-09' ? 'find_checkmate' : 'best_move';
        prompt = {
          en: quizText.en.move(fact.topic.en),
          fr: quizText.fr.move(fact.topic.fr),
          ar: quizText.ar.move(fact.topic.ar),
        };
        const correctIndex = (lessonId.length + factIndex) % 4;
        ({ choices, correctAnswer } = legalMoveChoices(seed.fen, seed.bestMove, correctIndex));
        explanation = seed.annotation;
        fen = seed.fen;
        solutionMoves = [seed.bestMove];
      } else {
        type = 'identify_mistake';
        prompt = {
          en: quizText.en.mistake(fact.misconception.en),
          fr: quizText.fr.mistake(fact.misconception.fr),
          ar: quizText.ar.mistake(fact.misconception.ar),
        };
        choices = [
          { id: 'true', label: text(quizText.en.true, quizText.fr.true, quizText.ar.true) },
          { id: 'false', label: text(quizText.en.false, quizText.fr.false, quizText.ar.false) },
        ];
        correctAnswer = 'false';
      }

      questions.push({
        id: `${lessonId}-q${String(questionNumber).padStart(2, '0')}`,
        lessonId,
        questionNumber,
        difficulty,
        type,
        prompt,
        choices,
        correctAnswer,
        explanation,
        hint: {
          en: `${quizText.en.answer} ${fact.topic.en}`,
          fr: `${quizText.fr.answer} ${fact.topic.fr}`,
          ar: `${quizText.ar.answer} ${fact.topic.ar}`,
        },
        ...(fen ? { fen, solutionMoves } : {}),
      });
    }
  });
  return questions;
}

export function getLevel1LessonForLanguage(lessonId: string, language: Language) {
  const lesson = getLevel1Lesson(lessonId);
  if (!lesson) return undefined;
  return {
    ...lesson,
    title: lesson.title[language],
    summary: lesson.summary[language],
    objectives: lesson.objectives.map((objective) => objective[language]),
    sections: lesson.sections.map((section) => ({
      title: section.title[language],
      paragraphs: section.paragraphs.map((paragraph) => paragraph[language]),
    })),
    terminology: lesson.terminology.map((item) => ({
      term: item.term[language],
      definition: item.definition[language],
    })),
    example: { ...lesson.example, annotation: lesson.example.annotation[language] },
    commonMistakes: lesson.commonMistakes.map((mistake) => mistake[language]),
    professionalTips: lesson.professionalTips.map((tip) => tip[language]),
    exercises: lesson.exercises.map((exercise) => exercise[language]),
    takeaways: lesson.takeaways.map((takeaway) => takeaway[language]),
  };
}
