// Ember → ULN (United Lawyer Network): русский язык по умолчанию, видимое название, русские темы.
// Протокольные константы ('ember/v1/...', 'ember-near', 'ember-self') НЕ трогаем: так ULN остаётся в одной сети с Ember.
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'ember','desktop'),S=path.join(D,'src');
const edit=(file,pairs)=>{const f=path.join(S,file);let s=fs.readFileSync(f,'utf8');
  for(const [a,b,all] of pairs){if(!s.includes(a))throw new Error(file+': нет якоря «'+a.slice(0,70)+'»');s=all?s.split(a).join(b):s.replace(a,()=>b)}
  fs.writeFileSync(f,s)};
const RUF=path.join(S,'i18n','ru.json');
const addRu=o=>{const j=JSON.parse(fs.readFileSync(RUF,'utf8'));Object.assign(j.strings,o);fs.writeFileSync(RUF,JSON.stringify(j,null,1))};

// ---------- перевод ----------
const ru=require('./uln-ru.js'),fr=require(path.join(S,'i18n','fr.json'));
const keys=Object.keys(fr.strings);
if(ru.strings.length!==keys.length)throw new Error('строк '+ru.strings.length+' вместо '+keys.length);
if(ru.patterns.length!==fr.patterns.length)throw new Error('шаблонов '+ru.patterns.length+' вместо '+fr.patterns.length);
const strings={};keys.forEach((k,i)=>strings[k]=ru.strings[i]);
const LAST_SEEN='^last seen (\\S+)$';
// время в русском виде пишется с пробелом («4 дн»), поэтому \S+ после него заменяем на .+
const WIDEN={[LAST_SEEN]:'^last seen (.+)$','^(@\\S+ · \\S+) · UNVERIFIED$':'^(@\\S+ · .+) · UNVERIFIED$'};
const patterns=fr.patterns.map((p,i)=>[WIDEN[p[0]]||p[0],ru.patterns[i]]);
patterns.push(['^(\\d+) FEED PEERS$','$1 ПО ЛЕНТАМ']);
strings['KEY']='КЛЮЧ';
fs.writeFileSync(RUF,JSON.stringify({_meta:{language:'Русский',note:'ULN: перевод интерфейса Ember. Ключи — точные английские строки.'},strings,patterns},null,1));

// ---------- интерфейс ----------
const TITLE_EN='UNITED LAWYER NETWORK · SERVERLESS · YOUR PEOPLE, NOT AN AUDIENCE';
edit('index.html',[
 ['<title>EMBER</title>','<title>ULN · United Lawyer Network</title>'],
 ['<span class="word">EMBER</span>','<span class="word">ULN</span>',true],
 ["const UI_LANGS = { en: ['ENGLISH', 'English'],","const UI_LANGS = { ru: ['РУССКИЙ', 'Русский'], en: ['ENGLISH', 'English'],"],
 ["function guessLang () { const n = (navigator.language || 'en').slice(0, 2).toLowerCase(); return UI_LANGS[n] ? n : 'en' }","function guessLang () { return 'ru' } // ULN: русский по умолчанию, остальные языки выбираются в НАСТРОЙКАХ"],
 ["const READ = { en: 'I ALSO READ',","const READ = { ru: 'Я ТАКЖЕ ЧИТАЮ', en: 'I ALSO READ',"],
 ["const GO = { en: 'CONTINUE →',","const GO = { ru: 'ДАЛЕЕ →', en: 'CONTINUE →',"],
 ['LANGUAGE · LANGUE · 语言 · اللغة','ЯЗЫК · LANGUAGE · LANGUE · 语言 · اللغة'],
 ["return LANG === 'fr' || LANG === 'en' ? l.toUpperCase() : l","return LANG === 'fr' || LANG === 'en' || LANG === 'ru' ? l.toUpperCase() : l"],
 ['SERVERLESS · YOUR PEOPLE, NOT AN AUDIENCE',TITLE_EN],
 ["  let lang = 'en'\n  try { lang = localStorage.getItem('emberLang') || 'en' } catch {}","  let lang = 'ru'\n  try { lang = localStorage.getItem('emberLang') || 'ru' } catch {}"],
 ["  if(s<60)return'now'; if(s<3600)return Math.floor(s/60)+'m'; if(s<86400)return Math.floor(s/3600)+'h'\n  return Math.floor(s/86400)+'d' }",
  "  const R = LANG === 'ru'\n  if(s<60)return R?'сейчас':'now'; if(s<3600)return Math.floor(s/60)+(R?'\\u00a0мин':'m'); if(s<86400)return Math.floor(s/3600)+(R?'\\u00a0ч':'h')\n  return Math.floor(s/86400)+(R?'\\u00a0дн':'d') }"],
]);
addRu({[TITLE_EN]:'ОБЪЕДИНЁННАЯ СЕТЬ ЮРИСТОВ · БЕЗ СЕРВЕРОВ · СВОИ ЛЮДИ, А НЕ АУДИТОРИЯ','EMBER':'ЖАР','only on the computer running ULN':'только на компьютере, где запущен ULN'});
for(const l of ['fr','zh','ar']){const f=path.join(S,'i18n',l+'.json'),j=JSON.parse(fs.readFileSync(f,'utf8'));const v=j.strings['SERVERLESS · YOUR PEOPLE, NOT AN AUDIENCE'];if(v)j.strings[TITLE_EN]='UNITED LAWYER NETWORK · '+v;fs.writeFileSync(f,JSON.stringify(j,null,1))}

// ---------- основной процесс ----------
edit('main.js',[
 ["if (!['fr', 'zh', 'ar'].includes(lang)) return null","if (!['ru', 'fr', 'zh', 'ar'].includes(lang)) return null"],
 ["const titles = { reply: 'Ember — new reply', dm: 'Ember — encrypted message', post: 'Ember — new post' }","const titles = { reply: 'ULN — новый ответ', dm: 'ULN — зашифрованное сообщение', post: 'ULN — новый пост' }"],
 ["title: titles[n.type] || 'Ember'","title: titles[n.type] || 'ULN'"],
 ["throw new Error('only on the computer running Ember')","throw new Error('only on the computer running ULN')",true],
 ["title: 'Export Ember identity', defaultPath: 'ember-identity.txt'","title: 'Резервная копия ключа ULN', defaultPath: 'uln-identity.txt'"],
 ["'EMBER IDENTITY BACKUP — KEEP THIS SECRET, KEEP IT SAFE'","'ULN (на основе Ember) · РЕЗЕРВНАЯ КОПИЯ КЛЮЧА — ХРАНИТЕ В ТАЙНЕ'"],
 ["{ label: 'Open Ember',","{ label: 'Открыть ULN',"],
 ["tray.setToolTip('Ember — online, broadcasting')","tray.setToolTip('ULN — в сети')"],
 ["console.error('Ember failed to start:'","console.error('ULN failed to start:'"],
 ["['EMBER IDENTITY BACKUP: KEEP THIS SECRET. Anyone with it IS you on the network.'","['ULN IDENTITY BACKUP: KEEP THIS SECRET. Anyone with it IS you on the network.'"],
 ['EMBER is running headless.','ULN (United Lawyer Network, based on Ember) is running headless.'],
 ["dialog.showErrorBox('Ember failed to start',","dialog.showErrorBox('ULN failed to start',"],
]);

// ---------- страница входа в браузере ----------
edit('web.js',[
 ['<title>EMBER · pair this browser</title>','<title>ULN · вход в браузере</title>'],
 ['<span class="word">EMBER</span>','<span class="word">ULN</span>'],
 ['<h1>PAIR THIS BROWSER</h1>','<h1>ВХОД В БРАУЗЕРЕ</h1>'],
 ['<p>Enter the code shown by the Ember that runs this page: in the app, SETUP › WEB ACCESS; on a server, the code it printed when it started. You only do this once per browser.</p>','<p>United Lawyer Network. Введите код сопряжения этого узла: в приложении он в НАСТРОЙКИ › ДОСТУП ИЗ БРАУЗЕРА, на сервере — в журнале запуска. Это нужно один раз для каждого браузера.</p>'],
 ['<button>PAIR →</button>','<button>ВОЙТИ →</button>'],
 ["'Too many wrong codes. Try again in ' + Math.ceil(j.retryIn / 60) + ' min.'","'Слишком много неверных кодов. Попробуйте через ' + Math.ceil(j.retryIn / 60) + ' мин.'"],
 ["'That code is not right (codes change after each pairing).'","'Код не подходит (после каждого сопряжения код меняется).'"],
 ["'Ember is not reachable.'","'ULN недоступен.'"],
 // на сайте узел живёт по адресу /node, а на / — приветственная страница: после входа остаёмся на своём адресе
 ["if (j.ok) { location.replace('/'); return }","if (j.ok) { location.replace(location.pathname); return }"],
 ["error: 'only on the computer running Ember'","error: 'only on the computer running ULN'"],
]);

{const f=path.join(D,'test','web.test.js');let t=fs.readFileSync(f,'utf8');if(!t.includes("r.text.includes('PAIR THIS BROWSER')"))throw new Error('web.test.js: нет якоря');fs.writeFileSync(f,t.replace("r.text.includes('PAIR THIS BROWSER')","r.text.includes('ВХОД В БРАУЗЕРЕ')"))}

// ---------- язык постов: кириллица ----------
edit('taste.js',[
 ["const LANGS = ['en', 'fr', 'zh', 'ar']","const LANGS = ['en', 'fr', 'zh', 'ar', 'ru']"],
 ["const han = (s.match(/[㐀-鿿]/g) || []).length,","const cyr = (s.match(/[Ѐ-ӿ]/g) || []).length, han = (s.match(/[㐀-鿿]/g) || []).length,"],
 ["  return lat ? 'latin' : 'other'","  if (cyr >= 3 && cyr >= lat / 2) return 'ru'\n  return lat ? 'latin' : 'other'"],
 ["  if (s === 'ar') return langs.includes('ar')","  if (s === 'ar') return langs.includes('ar')\n  if (s === 'ru') return langs.includes('ru')"],
 ["'في من على","'и в во не что он на я с со как а то все она так его но да ты к у же вы за бы по только ее мне было вот от меня еще нет о из ему теперь когда даже ну вдруг ли если уже или ни быть был него до вас нибудь опять уж вам ведь там потом себя ничего ей может они тут где есть надо ней для мы тебя их чем была сам чтоб без будто чего раз тоже себе под будет ж тогда кто этот того потому этого какой совсем ним здесь этом один почти мой тем чтобы нее сейчас были куда зачем всех никогда можно при наконец два об другой хоть после над больше тот через эти нас про всего них какая много разве три эту моя впрочем хорошо свою этой перед иногда лучше чуть том нельзя такой им более всегда конечно всю между это сегодня очень ' +\n  'في من على"],
]);

// ---------- темы: русские названия и опорные слова, плюс «Право» ----------
const RU={
 music:['Музыка','музыка песни альбом исполнитель концерт гитара бит продюсирование слушать плейлист'],
 art:['Искусство и иллюстрация','искусство иллюстрация рисунок живопись художник скетч акварель цифровая графика выставка'],
 pixel:['Пиксель-арт и ретро','пиксель арт ретро спрайт восьмибитный палитра денди эмулятор старые игры'],
 games:['Видеоигры','видеоигры игра геймер консоль прохождение стим релиз мультиплеер инди'],
 film:['Кино и сериалы','кино фильм сериал режиссёр премьера сезон серия кинотеатр актёр сценарий'],
 books:['Книги и литература','книги роман чтение писатель автор рукопись поэзия библиотека издательство рассказ'],
 photo:['Фотография','фотография фото камера объектив плёнка съёмка кадр экспозиция портрет пейзаж'],
 code:['Программирование','программирование код разработчик баг функция репозиторий javascript python сервер релиз'],
 ai:['ИИ и машинное обучение','искусственный интеллект нейросеть машинное обучение модель обучение датасет языковая модель промпт'],
 privacy:['Приватность и безопасность','приватность конфиденциальность безопасность шифрование слежка утечка данных пароль анонимность'],
 oss:['Открытый код и Linux','открытый код linux свободное ПО дистрибутив терминал лицензия gpl ядро сообщество'],
 science:['Наука и космос','наука космос исследование физика астрономия ракета планета биология эксперимент'],
 philosophy:['Философия','философия этика смысл сознание мораль метафизика философ мышление'],
 faith:['Вера и духовность','вера духовность молитва церковь бог религия душа медитация'],
 history:['История','история историк война империя век архив древний революция'],
 world:['Новости и мир','новости мир политика выборы правительство страна события кризис'],
 football:['Футбол и спорт','футбол спорт матч гол команда чемпионат тренер лига болельщик'],
 fitness:['Фитнес и здоровье','фитнес здоровье тренировка спортзал бег питание сон мышцы'],
 food:['Кулинария и еда','кулинария еда рецепт готовить ужин выпечка ресторан блюдо кухня'],
 travel:['Путешествия','путешествия поездка отпуск билет поезд самолёт город страна отель'],
 languages:['Языки и обучение','языки изучение язык грамматика словарь произношение учитель урок перевод'],
 anime:['Аниме и манга','аниме манга серия персонаж сезон студия косплей'],
 design:['Дизайн и интерфейсы','дизайн интерфейс макет шрифт типографика figma пользователь прототип'],
 fashion:['Мода и стритвир','мода одежда стиль кроссовки стритвир бренд коллекция образ'],
};
const tf=path.join(S,'topics.json'),T=JSON.parse(fs.readFileSync(tf,'utf8'));
for(const t of T.topics){const r=RU[t.id];if(!r)throw new Error('нет перевода темы '+t.id);t.label.ru=r[0];t.seeds.ru=r[1]}
if(!T.topics.some(t=>t.id==='law'))T.topics.unshift({id:'law',
 label:{en:'Law & legal practice',fr:'Droit et pratique juridique',zh:'法律与法律实务',ar:'القانون والممارسة القانونية',ru:'Право и юридическая практика'},
 seeds:{en:'law lawyer attorney court case contract litigation statute judge legal advice',fr:'droit avocat tribunal affaire contrat litige loi juge conseil juridique',zh:'法律 律师 法院 案件 合同 诉讼 法规 法官 法律咨询',ar:'قانون محامي محكمة قضية عقد دعوى تشريع قاضي استشارة قانونية',ru:'право юрист адвокат суд дело договор иск закон судья арбитраж банкротство юридическая консультация'},
 keys:['lawyer','attorney','litigation','court','contract','юрист','адвокат','суд','иск','арбитраж','договор','банкротство','avocat','tribunal','律师','محامي']});
fs.writeFileSync(tf,JSON.stringify(T,null,1));

// ---------- название пакета и указание на исходный проект ----------
{const f=path.join(D,'package.json'),p=JSON.parse(fs.readFileSync(f,'utf8'));p.name='uln-desktop';p.productName='ULN';p.description='ULN — United Lawyer Network. Русская сборка Ember (https://github.com/CRTnoise/ember-p2p), GPL-3.0-or-later';p.build.productName='ULN';p.build.appId='ru.a2chatsky.uln';
  // имена файлов и ярлыков сборки: Ember → ULN
  const b=p.build;if(b.nsis){b.nsis.shortcutName='ULN';b.nsis.artifactName='ULN-Setup-${version}.${ext}'}if(b.portable)b.portable.artifactName='ULN-${version}-portable.${ext}';
  if(b.linux){b.linux.executableName='uln';b.linux.artifactName='ULN-${version}.${ext}';if(b.linux.desktop&&b.linux.desktop.entry)b.linux.desktop.entry.StartupWMClass='ULN';else if(b.linux.desktop&&b.linux.desktop.StartupWMClass)b.linux.desktop.StartupWMClass='ULN'}
  if(b.deb)b.deb.artifactName='uln_${version}_${arch}.${ext}';p.desktopName='uln.desktop';p.homepage='https://social.a2chatsky.ru';
  const left=JSON.stringify(b).match(/[Ee]mber/g);if(left)throw new Error('в настройках сборки осталось Ember: '+left.length);fs.writeFileSync(f,JSON.stringify(p,null,2)+'\n')}
fs.writeFileSync(path.join(__dirname,'ember','ULN.md'),`# ULN — United Lawyer Network

Русская сборка [Ember](https://github.com/CRTnoise/ember-p2p) (автор — CRTnoise), распространяется на тех же условиях: GNU GPL 3.0 или более поздней версии (см. LICENSE, NOTICE.md).

Что изменено относительно Ember 2.9.0:
- видимое название ULN · United Lawyer Network вместо Ember;
- русский язык интерфейса (desktop/src/i18n/ru.json), выбран по умолчанию;
- русские названия и опорные слова тем, тема «Право и юридическая практика»;
- распознавание кириллицы в постах (desktop/src/taste.js);
- русская страница входа в браузере (desktop/src/web.js).

Сетевой протокол не менялся: узлы ULN и Ember видят друг друга.
`);
console.log('ok');
