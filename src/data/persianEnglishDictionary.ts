/**
 * Curated Persian → English concept dictionary for cross-lingual search.
 *
 * ---------------------------------------------------------------------------
 * How to extend (no code changes needed):
 *   1. Add one line per Persian term inside the matching category below:
 *        'واژه فارسی': ['english', 'synonyms', 'up to 4'],
 *   2. Write the key the way users type it. Lookup normalises orthography
 *      automatically (ی/ک variants, ZWNJ → space, diacritics, hamza forms),
 *      so 'برنامه ریزی' and 'برنامه‌ریزی' are the same key.
 *   3. Values are English search terms, most useful first (2–4 terms).
 *      They are sent to the sources as extra queries and shown to the user,
 *      so keep them plain, lowercase except known acronyms (PDF, CRM), and
 *      avoid generic words such as "app" or "best".
 * ---------------------------------------------------------------------------
 */

export type PersianEnglishDictionary = Record<string, readonly string[]>;

export const PERSIAN_ENGLISH_DICTIONARY: PersianEnglishDictionary = {
  /* ---- Art, drawing & design ---- */
  'نقاشی': ['drawing', 'painting', 'sketch'],
  'طراحی': ['design', 'illustration', 'drawing'],
  'اسکیس': ['sketch', 'sketching', 'drawing'],
  'اسکچ': ['sketch', 'sketching'],
  'هنر': ['art', 'artwork'],
  'هنر دیجیتال': ['digital art', 'digital painting'],
  'پرتره': ['portrait', 'portrait drawing'],
  'رنگ آمیزی': ['coloring', 'coloring book'],
  'خوشنویسی': ['calligraphy', 'lettering'],
  'خطاطی': ['calligraphy', 'lettering'],
  'لوگو': ['logo', 'logo design', 'logo maker'],
  'آیکون': ['icons', 'icon design'],
  'گالری': ['gallery', 'portfolio'],
  'انیمیشن': ['animation', 'animated'],
  'سه بعدی': ['3d modeling', '3d'],
  'گرافیک': ['graphic design', 'graphics'],

  /* ---- Notes, journal & diary ---- */
  'یادداشت': ['notes', 'note taking'],
  'یادداشت برداری': ['note taking', 'notes'],
  'دفترچه': ['notebook', 'notes'],
  'دفترچه یادداشت': ['notepad', 'notes'],
  'ژورنال': ['journal', 'journaling'],
  'دفترچه خاطرات': ['diary', 'journal'],
  'خاطرات': ['diary', 'journal'],
  'مارک داون': ['markdown', 'markdown editor'],

  /* ---- Calendar, planner & schedule ---- */
  'تقویم': ['calendar', 'calendar app'],
  'برنامه ریزی': ['planner', 'planning'],
  'برنامه هفتگی': ['weekly planner', 'schedule'],
  'زمان بندی': ['schedule', 'scheduling'],
  'رویداد': ['events', 'event calendar'],
  'جلسه': ['meetings', 'meeting scheduler'],
  'یادآور': ['reminders', 'reminder app'],

  /* ---- To-do, tasks & productivity ---- */
  'کارها': ['todo', 'tasks'],
  'کار روزانه': ['todo', 'daily tasks'],
  'لیست کارها': ['to-do list', 'task list'],
  'فهرست کارها': ['to-do list', 'task list'],
  'وظایف': ['tasks', 'to-do'],
  'تودو': ['todo', 'to-do app'],
  'بهره وری': ['productivity'],
  'تمرکز': ['focus', 'focus timer'],
  'پومودورو': ['pomodoro', 'focus timer'],
  'چک لیست': ['checklist', 'to-do list'],
  'هدف': ['goals', 'goal tracker'],
  'عادت': ['habit', 'habit tracker'],
  'عادت ها': ['habit tracker', 'habits'],
  'ردیاب عادت': ['habit tracker', 'habit'],

  /* ---- Money: expenses, budget & finance ---- */
  'هزینه': ['expense', 'expense tracker'],
  'هزینه ها': ['expenses', 'spending tracker'],
  'مدیریت هزینه': ['expense tracker', 'spending tracker'],
  'بودجه': ['budget', 'budgeting'],
  'مدیریت مالی': ['personal finance', 'money management'],
  'مالی شخصی': ['personal finance', 'finance'],
  'حسابداری': ['accounting', 'bookkeeping'],
  'حساب و کتاب': ['bookkeeping', 'expenses'],
  'فاکتور': ['invoice', 'invoicing'],
  'صورتحساب': ['invoice', 'billing'],
  'حقوق و دستمزد': ['payroll', 'salary'],
  'درآمد': ['income', 'revenue'],
  'پس انداز': ['savings', 'saving goals'],
  'تبدیل ارز': ['currency converter', 'exchange rates'],
  'رمزارز': ['crypto', 'cryptocurrency'],
  'کیف پول': ['wallet', 'crypto wallet'],

  /* ---- Shopping & grocery ---- */
  'خرید': ['shopping'],
  'فروشگاه آنلاین': ['online store', 'e-commerce'],
  'لیست خرید': ['shopping list', 'grocery list'],
  'خواربار': ['grocery', 'groceries'],
  'سبد خرید': ['shopping cart', 'cart'],
  'مقایسه قیمت': ['price comparison', 'price tracker'],
  'تخفیف': ['deals', 'discounts'],

  /* ---- Food: recipes & cooking ---- */
  'دستور پخت': ['recipe', 'recipes'],
  'دستور آشپزی': ['recipe', 'recipes'],
  'آشپزی': ['cooking', 'recipes'],
  'غذا': ['food', 'meal'],
  'رژیم غذایی': ['diet', 'meal planner'],
  'رستوران': ['restaurant', 'menu'],
  'آشپزخانه': ['kitchen', 'pantry'],
  'قهوه': ['coffee', 'cafe'],

  /* ---- Health, fitness & workout ---- */
  'تناسب اندام': ['fitness', 'workout'],
  'ورزش': ['workout', 'exercise', 'fitness'],
  'تمرین ورزشی': ['workout', 'training'],
  'باشگاه': ['gym', 'workout'],
  'یوگا': ['yoga'],
  'سلامت': ['health', 'wellness'],
  'سلامتی': ['health', 'wellness'],
  'وزن': ['weight', 'weight tracker'],
  'ردیاب وزن': ['weight tracker', 'bmi'],
  'قدم شمار': ['step counter', 'pedometer'],
  'خواب': ['sleep', 'sleep tracker'],
  'نوشیدن آب': ['water tracker', 'hydration'],
  'دارو': ['medication', 'medicine reminder'],
  'دوره پریود': ['period tracker'],
  'فشار خون': ['blood pressure', 'health tracker'],

  /* ---- Music, video & photo ---- */
  'موسیقی': ['music', 'music player'],
  'آهنگ': ['music', 'songs'],
  'پخش کننده موسیقی': ['music player', 'audio player'],
  'ویدیو': ['video', 'video player'],
  'ویدئو': ['video', 'video player'],
  'ویرایش ویدیو': ['video editor', 'video editing'],
  'فیلم': ['movies', 'films'],
  'سریال': ['tv shows', 'series tracker'],
  'عکس': ['photo', 'photos'],
  'عکاسی': ['photography', 'camera'],
  'ویرایش عکس': ['photo editor', 'image editing'],
  'گالری عکس': ['photo gallery'],
  'پادکست': ['podcast'],
  'کتاب صوتی': ['audiobook', 'audio books'],

  /* ---- Chat & messaging ---- */
  'چت': ['chat', 'messaging'],
  'گفتگو': ['chat', 'messaging'],
  'پیام رسان': ['messenger', 'messaging'],
  'پیامک': ['sms', 'texting'],
  'ایمیل': ['email', 'mail client'],
  'تماس تصویری': ['video calls', 'conferencing'],

  /* ---- Learning, education & flashcards ---- */
  'آموزش': ['learning', 'education', 'tutorials'],
  'یادگیری': ['learning', 'study'],
  'یادگیری زبان': ['language learning', 'vocabulary'],
  'زبان انگلیسی': ['english learning', 'vocabulary'],
  'مطالعه': ['study', 'studying'],
  'فلش کارت': ['flashcards', 'spaced repetition'],
  'آزمون': ['quiz', 'exam'],
  'آزمون ساز': ['quiz app', 'quiz maker'],
  'واژه نامه': ['dictionary', 'vocabulary'],
  'لغت': ['vocabulary', 'words'],
  'کتاب': ['books', 'reading'],
  'کتاب خوانی': ['reading tracker', 'books'],
  'کتابخانه': ['library', 'book tracker'],
  'درس': ['courses', 'lessons'],
  'مدرسه': ['school', 'education'],

  /* ---- Coding & programming ---- */
  'برنامه نویسی': ['coding', 'programming'],
  'کدنویسی': ['coding', 'programming'],
  'توسعه وب': ['web development', 'web app'],
  'وب سایت': ['website', 'web app'],
  'اپلیکیشن': ['app', 'application'],
  'پایگاه داده': ['database', 'sql'],
  'گیت': ['git', 'version control'],
  'ترمینال': ['terminal', 'console'],
  'دیباگ': ['debugging', 'developer tools'],

  /* ---- Writing & blogging ---- */
  'نوشتن': ['writing', 'writing app'],
  'وبلاگ': ['blog', 'blogging'],
  'وبلاگ نویسی': ['blogging', 'blog'],
  'داستان': ['stories', 'novel writing'],
  'شعر': ['poetry', 'poems'],
  'تایپ': ['typing', 'typing practice'],
  'ویرایشگر متن': ['text editor', 'editor'],

  /* ---- Files, PDF & documents ---- */
  'مدیریت فایل': ['file manager', 'files'],
  'فایل': ['files', 'file storage'],
  'مدیریت رمز': ['password manager', 'passwords'],
  'رمز عبور': ['password manager', 'passwords'],
  'پسورد': ['password manager', 'passwords'],
  'تبدیل فایل': ['file converter'],
  'اسناد': ['documents', 'docs'],
  'پی دی اف': ['pdf', 'pdf tools'],
  'اسکن': ['scanner', 'document scanning'],
  'رزومه': ['resume', 'cv', 'resume builder'],
  'قرارداد': ['contracts', 'documents'],
  'پشتیبان گیری': ['backup', 'backups'],

  /* ---- Business: CRM, projects & inventory ---- */
  'مدیریت پروژه': ['project management', 'kanban'],
  'کانبان': ['kanban', 'project board'],
  'مدیریت مشتری': ['crm', 'customer management'],
  'مشتریان': ['crm', 'clients'],
  'سی آر ام': ['crm'],
  'فروش': ['sales', 'point of sale'],
  'انبار': ['inventory', 'warehouse'],
  'انبارداری': ['inventory management', 'stock'],
  'تیم': ['team', 'collaboration'],
  'نظرسنجی': ['survey', 'polls'],
  'فرم ساز': ['form builder', 'forms'],
  'استارتاپ': ['startup'],

  /* ---- Everyday tools ---- */
  'ماشین حساب': ['calculator'],
  'تبدیل واحد': ['unit converter', 'converter'],
  'آب و هوا': ['weather', 'weather forecast'],
  'پیش بینی آب و هوا': ['weather forecast', 'weather'],
  'نقشه': ['maps', 'navigation'],
  'مسیریابی': ['navigation', 'directions'],
  'ترجمه': ['translation', 'translator'],
  'ساعت': ['clock', 'alarm'],
  'تایمر': ['timer', 'stopwatch'],
  'بازی': ['games', 'game'],
  'پازل': ['puzzle', 'puzzle game'],
  'خبر': ['news', 'news reader'],
  'آگهی': ['classifieds', 'listings'],
  'املاک': ['real estate', 'property listings'],
  'تاکسی اینترنتی': ['ride hailing', 'taxi app'],
  'بلیط': ['tickets', 'booking'],
  'بلیت': ['tickets', 'booking'],
  'رزرو': ['booking', 'reservations'],
  'هتل': ['hotel booking', 'hotels'],
};
