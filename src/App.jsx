import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingBasket,
  Refrigerator,
  Plus,
  Check,
  Trash2,
  RotateCcw,
  X,
  Minus,
  Snowflake,
  ChevronDown,
  UtensilsCrossed,
  Camera,
  ImagePlus,
} from "lucide-react";

const STORAGE_KEY = "grocery-fridge-app:v1";

/* ---------- design tokens ---------- */
const C = {
  bg: "#F5F7FB",
  surface: "#FFFFFF",
  ink: "#17263F",
  muted: "#7C8698",
  line: "#E8ECF4",
  fresh: "#3B82F6", // hero blue — 冷藏 & good freshness
  freshSoft: "#E7F0FE",
  buy: "#F9744F", // 買菜 warm coral (contrast to the cold blues)
  buySoft: "#FDEAE3",
  warn: "#F5A524",
  danger: "#EF5350",
  dangerSoft: "#FCE7E6",
  frost: "#1E48C9", // 冷凍 deep blue
  frostSoft: "#E4E9FB",
};

/* nutrition-oriented food groups (Taiwan 六大類食物 + practical extras) */
const CATEGORIES = [
  { key: "grain", label: "全穀雜糧", emoji: "🍚", life: 14 },
  { key: "eggbean", label: "蛋豆類", emoji: "🥚", life: 10 },
  { key: "seafood", label: "海鮮類", emoji: "🐟", life: 2 },
  { key: "meat", label: "肉類", emoji: "🥩", life: 3 },
  { key: "dairy", label: "乳品類", emoji: "🥛", life: 10 },
  { key: "veg", label: "蔬菜類", emoji: "🥬", life: 5 },
  { key: "fruit", label: "水果類", emoji: "🍎", life: 6 },
  { key: "fatnut", label: "油脂堅果", emoji: "🥜", life: 60 },
  { key: "ready", label: "即食食品", emoji: "🍱", life: 3 },
  { key: "sauce", label: "調味料", emoji: "🧂", life: 180 },
  { key: "drink", label: "飲料", emoji: "🥤", life: 20 },
  { key: "other", label: "其他", emoji: "📦", life: 7 },
];
const LEGACY_CAT = { staple: "grain", bean: "eggbean", frozen: "other" };
const normalizeCat = (k) => {
  const kk = LEGACY_CAT[k] || k;
  return CATEGORIES.some((c) => c.key === kk) ? kk : "other";
};
const catOf = (k) => CATEGORIES.find((c) => c.key === k) || CATEGORIES[CATEGORIES.length - 1];

/* ---------- auto category detection (Taiwan grocery keywords) ---------- */
const CAT_KEYWORDS = {
  grain: ["白米","糙米","糯米","米飯","飯糰","米粉","冬粉","河粉","拉麵","烏龍麵","蕎麥麵","義大利麵","通心粉","麵條","麵包","吐司","土司","饅頭","包子","貝果","麥片","燕麥","藜麥","薏仁","玉米","地瓜","番薯","馬鈴薯","洋芋","芋頭","南瓜","山藥","年糕","蘿蔔糕","蛋糕","餅乾","米","飯","麵"],
  eggbean: ["雞蛋","鴨蛋","皮蛋","鹹蛋","溏心蛋","滷蛋","茶葉蛋","雞蛋豆腐","百頁豆腐","凍豆腐","油豆腐","臭豆腐","豆腐","豆干","豆乾","豆包","豆皮","豆漿","納豆","毛豆","黃豆","黑豆","綠豆","紅豆","鷹嘴豆","素肉","麵腸","蛋"],
  seafood: ["鮭魚","鯖魚","鱈魚","鮪魚","旗魚","鯛魚","鱸魚","秋刀魚","虱目魚","吳郭魚","石斑","白蝦","草蝦","蝦仁","蝦","螃蟹","蟹","花枝","透抽","魷魚","章魚","小卷","蛤蜊","文蛤","花蛤","蛤","牡蠣","蚵","干貝","扇貝","淡菜","鮑魚","海參","龍蝦","蜆","魚"],
  meat: ["豬肉","牛肉","雞肉","鴨肉","羊肉","雞胸","雞腿","雞翅","雞胗","雞心","里肌","五花","梅花肉","松阪","培根","火腿","香腸","熱狗","絞肉","排骨","牛排","豬排","牛腩","牛腱","肉片","肉絲","肉塊","肉鬆","豬肝","大腸","肉"],
  dairy: ["鮮奶油","鮮奶","牛奶","羊奶","優格","優酪乳","起司","起士","乳酪","奶酪","保久乳","調味乳","煉乳","奶粉","奶"],
  veg: ["高麗菜","大白菜","小白菜","青江菜","菠菜","空心菜","地瓜葉","花椰菜","青花菜","白花椰","芥藍","芥菜","萵苣","生菜","洋蔥","青蔥","蔥","大蒜","蒜","嫩薑","薑","辣椒","紅蘿蔔","胡蘿蔔","白蘿蔔","蘿蔔","小黃瓜","大黃瓜","黃瓜","苦瓜","絲瓜","冬瓜","櫛瓜","茄子","青椒","彩椒","甜椒","豆芽","芹菜","韭菜","秋葵","玉米筍","茭白筍","竹筍","蘆筍","金針菇","杏鮑菇","香菇","木耳","菇","番茄","蕃茄","九層塔","香菜","茼蒿","莧菜","龍鬚菜","青菜","青花","菜"],
  fruit: ["蘋果","香蕉","橘子","柳丁","柳橙","葡萄柚","葡萄","西瓜","哈密瓜","香瓜","鳳梨","芒果","草莓","藍莓","奇異果","火龍果","木瓜","芭樂","蓮霧","荔枝","龍眼","水梨","水蜜桃","桃子","李子","櫻桃","檸檬","柚子","棗子","百香果","小番茄","聖女","梨","橙"],
  fatnut: ["橄欖油","苦茶油","花生油","芝麻油","葵花油","椰子油","沙拉油","香油","奶油","花生醬","花生","杏仁","腰果","核桃","開心果","夏威夷豆","芝麻","瓜子","松子","堅果","酪梨","油"],
  ready: ["御飯糰","三明治","漢堡","水餃","餃子","湯包","小籠包","餛飩","燒賣","春捲","蔥油餅","蛋餅","蘿蔔糕","泡麵","速食麵","罐頭","火鍋料","貢丸","魚丸","蟹肉棒","甜不辣","關東煮","雞塊","雞排","薯條","披薩","比薩","滷味","鹹酥雞","便當","即食","微波","冷凍","沙拉","熟食"],
  sauce: ["醬油","蠔油","沙茶醬","沙茶","番茄醬","辣椒醬","豆瓣醬","味噌","咖哩塊","咖哩","米酒","味醂","太白粉","地瓜粉","胡椒","白胡椒","黑胡椒","味精","味素","蜂蜜","果醬","沙拉醬","美乃滋","高湯","雞粉","鹽","糖","醋","醬"],
  drink: ["礦泉水","氣泡水","蘇打水","椰子水","檸檬水","運動飲料","能量飲料","養樂多","米漿","果汁","汽水","可樂","奶茶","綠茶","紅茶","烏龍茶","茶","咖啡","拿鐵","啤酒","紅酒","白酒","汽泡","水"],
};
// flatten + sort by keyword length desc so specific words win (雞蛋豆腐 before 蛋)
const DETECT_LIST = Object.entries(CAT_KEYWORDS)
  .flatMap(([cat, words]) => words.map((w) => [w, cat]))
  .sort((a, b) => b[0].length - a[0].length);
const detectCat = (name) => {
  const n = (name || "").trim();
  if (!n) return null;
  for (const [w, c] of DETECT_LIST) if (n.includes(w)) return c;
  return null;
};

/* ---------- date helpers ---------- */
const todayStr = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};
const addDays = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const daysUntil = (iso) => {
  if (!iso) return null;
  const a = new Date(todayStr());
  const b = new Date(iso);
  return Math.round((b - a) / 86400000);
};
const fmtDate = (iso) => {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
};

const freshness = (iso) => {
  const d = daysUntil(iso);
  if (d === null) return { key: "none", color: C.muted, label: "未設定", ratio: 0 };
  if (d < 0) return { key: "expired", color: C.danger, label: `過期 ${-d} 天`, ratio: 0 };
  if (d <= 3) return { key: "soon", color: C.warn, label: `剩 ${d} 天`, ratio: 0.28 };
  if (d <= 7) return { key: "ok", color: C.fresh, label: `剩 ${d} 天`, ratio: 0.6 };
  return { key: "fresh", color: C.fresh, label: `剩 ${d} 天`, ratio: 1 };
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* compress an uploaded image to a small JPEG data URL so it fits in storage */
async function compressImage(file, maxDim = 900, quality = 0.72) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = dataUrl;
  });
  let { width, height } = img;
  if (Math.max(width, height) > maxDim) {
    const s = maxDim / Math.max(width, height);
    width = Math.round(width * s);
    height = Math.round(height * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
const photoKey = (id) => `meal-photo:${id}`;

/* ---------- shared expiry presets ---------- */
const CHILL_PRESETS = [
  { label: "3 天", days: 3 },
  { label: "1 週", days: 7 },
  { label: "2 週", days: 14 },
  { label: "1 個月", days: 30 },
];
const FREEZE_PRESETS = [
  { label: "2 週", days: 14 },
  { label: "1 個月", days: 30 },
  { label: "3 個月", days: 90 },
  { label: "6 個月", days: 180 },
];
const recommendPreset = (cat, store) =>
  store === "freeze"
    ? FREEZE_PRESETS[2]
    : CHILL_PRESETS.reduce((best, p) =>
        Math.abs(p.days - cat.life) < Math.abs(best.days - cat.life) ? p : best
      );

/* ---------- root ---------- */
export default function App() {
  const [data, setData] = useState({ shopping: [], fridge: [], learned: {}, meals: [] });
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("shop");
  const [buying, setBuying] = useState(null);
  const [addingFridge, setAddingFridge] = useState(null); // { store } when open
  const [addingMeal, setAddingMeal] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  /* load + migrate old data */
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const p = JSON.parse(res.value);
          const shopping = (p.shopping || []).map((i) => ({ ...i, cat: normalizeCat(i.cat) }));
          const fridge = (p.fridge || []).map((i) => ({
            ...i,
            store: i.store || (i.cat === "frozen" ? "freeze" : "chill"),
            cat: normalizeCat(i.cat),
          }));
          setData({ shopping, fridge, learned: p.learned || {}, meals: p.meals || [] });
        }
      } catch (e) {
        /* first run */
      }
      setLoaded(true);
    })();
  }, []);

  /* save */
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {}
    })();
  }, [data, loaded]);

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  /* actions */
  const addShopping = (name, catKey, qty) =>
    setData((d) => ({ ...d, shopping: [{ id: uid(), name, cat: catKey, qty }, ...d.shopping] }));
  const removeShopping = (id) =>
    setData((d) => ({ ...d, shopping: d.shopping.filter((i) => i.id !== id) }));
  const changeQty = (list, id, delta) =>
    setData((d) => ({
      ...d,
      [list]: d[list].map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
    }));

  const confirmBuy = (item, expiryDate, store) => {
    setData((d) => ({
      ...d,
      shopping: d.shopping.filter((i) => i.id !== item.id),
      fridge: [
        { id: uid(), name: item.name, cat: item.cat, qty: item.qty, added: todayStr(), expiry: expiryDate, store },
        ...d.fridge,
      ],
    }));
    setBuying(null);
    flash(`${catOf(item.cat).emoji} ${item.name} 已放進${store === "freeze" ? "冷凍" : "冷藏"}`);
  };

  /* remember a manual category correction: item name -> category */
  const learnCat = (name, catKey) => {
    const key = name.trim();
    if (!key) return;
    setData((d) => ({ ...d, learned: { ...(d.learned || {}), [key]: catKey } }));
  };

  /* add an item straight into the fridge (existing / non-purchased food) */
  const addFridge = ({ name, cat, qty, store, expiry }) => {
    setData((d) => ({
      ...d,
      fridge: [{ id: uid(), name, cat, qty, added: todayStr(), expiry, store }, ...d.fridge],
    }));
    setAddingFridge(null);
    flash(`${catOf(cat).emoji} ${name} 已加入${store === "freeze" ? "冷凍" : "冷藏"}`);
  };

  /* meal records — photo stored under its own key to stay within storage limits */
  const addMeal = async ({ name, date, ingredients, note, photo }) => {
    const id = uid();
    if (photo) {
      try {
        await window.storage.set(photoKey(id), photo);
      } catch (e) {
        /* photo save best-effort */
      }
    }
    setData((d) => ({
      ...d,
      meals: [{ id, name, date, ingredients, note, hasPhoto: !!photo }, ...(d.meals || [])],
    }));
    setAddingMeal(false);
    flash(`🍳 已記錄「${name}」`);
  };
  const deleteMeal = async (id) => {
    setData((d) => ({ ...d, meals: (d.meals || []).filter((m) => m.id !== id) }));
    try {
      await window.storage.delete(photoKey(id));
    } catch (e) {
      /* ignore */
    }
  };

  const useUp = (id) => setData((d) => ({ ...d, fridge: d.fridge.filter((i) => i.id !== id) }));
  const moveStore = (id, store) => {
    const it = data.fridge.find((i) => i.id === id);
    if (it && it.store === store) return; // already there
    setData((d) => ({
      ...d,
      fridge: d.fridge.map((i) => (i.id === id ? { ...i, store } : i)),
    }));
    if (it) flash(`${catOf(it.cat).emoji} ${it.name} 移到${store === "freeze" ? "冷凍" : "冷藏"}`);
  };
  const backToShopping = (item) => {
    setData((d) => ({
      ...d,
      fridge: d.fridge.filter((i) => i.id !== item.id),
      shopping: [{ id: uid(), name: item.name, cat: item.cat, qty: 1 }, ...d.shopping],
    }));
    flash(`${catOf(item.cat).emoji} ${item.name} 已加進補貨清單`);
  };

  const fridgeSorted = useMemo(
    () =>
      [...data.fridge].sort((a, b) => {
        const da = daysUntil(a.expiry), db = daysUntil(b.expiry);
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      }),
    [data.fridge]
  );
  const expiredCount = data.fridge.filter((i) => daysUntil(i.expiry) < 0).length;
  const soonCount = data.fridge.filter((i) => {
    const d = daysUntil(i.expiry);
    return d !== null && d >= 0 && d <= 3;
  }).length;
  const alertCount = expiredCount + soonCount;

  if (!loaded) {
    return (
      <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.muted, fontSize: 14 }}>載入清單中…</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <StyleTag />

      <header style={styles.header}>
        <div style={styles.brandMark}>
          <Snowflake size={18} strokeWidth={2.4} color={C.fresh} />
        </div>
        <div>
          <div style={styles.brandName}>小廚房日記</div>
          <div style={styles.brandSub}>買到就進冰箱 · 記錄食譜靈感庫</div>
        </div>
      </header>

      <main style={styles.main}>
        {tab === "shop" ? (
          <ShopView
            items={data.shopping}
            learned={data.learned || {}}
            onLearn={learnCat}
            onAdd={addShopping}
            onBuy={(it) => setBuying(it)}
            onRemove={removeShopping}
            onQty={(id, delta) => changeQty("shopping", id, delta)}
          />
        ) : tab === "fridge" ? (
          <FridgeView
            items={fridgeSorted}
            expiredCount={expiredCount}
            soonCount={soonCount}
            onUseUp={useUp}
            onBack={backToShopping}
            onQty={(id, delta) => changeQty("fridge", id, delta)}
            onMove={moveStore}
            onAddManual={(store) => setAddingFridge({ store })}
          />
        ) : (
          <MealsView
            meals={data.meals || []}
            onAdd={() => setAddingMeal(true)}
            onDelete={deleteMeal}
          />
        )}
      </main>

      <nav style={styles.tabbar}>
        <TabButton
          active={tab === "shop"}
          onClick={() => setTab("shop")}
          icon={<ShoppingBasket size={22} strokeWidth={2.2} />}
          label="買菜"
          accent={C.buy}
          badge={data.shopping.length || null}
          badgeColor={C.buy}
        />
        <TabButton
          active={tab === "fridge"}
          onClick={() => setTab("fridge")}
          icon={<Refrigerator size={22} strokeWidth={2.2} />}
          label="冰箱"
          accent={C.fresh}
          badge={alertCount || null}
          badgeColor={expiredCount ? C.danger : C.warn}
          pulse={alertCount > 0}
        />
        <TabButton
          active={tab === "meals"}
          onClick={() => setTab("meals")}
          icon={<UtensilsCrossed size={21} strokeWidth={2.2} />}
          label="料理"
          accent={C.buy}
          badge={(data.meals || []).length || null}
          badgeColor={C.buy}
        />
      </nav>

      {buying && (
        <ExpirySheet item={buying} onCancel={() => setBuying(null)} onConfirm={confirmBuy} />
      )}

      {addingFridge && (
        <AddFridgeSheet
          defaultStore={addingFridge.store}
          learned={data.learned || {}}
          onLearn={learnCat}
          onCancel={() => setAddingFridge(null)}
          onConfirm={addFridge}
        />
      )}

      {addingMeal && (
        <AddMealSheet
          fridgeItems={data.fridge || []}
          onCancel={() => setAddingMeal(false)}
          onConfirm={addMeal}
        />
      )}

      {toast && <div style={styles.toast} className="gf-toast">{toast}</div>}
    </div>
  );
}

/* ---------- tab button ---------- */
function TabButton({ active, onClick, icon, label, accent, badge, badgeColor, pulse }) {
  return (
    <button onClick={onClick} className="gf-tap" style={{ ...styles.tabBtn, color: active ? accent : C.muted }}>
      <div style={{ position: "relative" }}>
        {icon}
        {badge != null && (
          <span className={pulse ? "gf-pulse" : ""} style={{ ...styles.tabBadge, background: badgeColor }}>
            {badge}
          </span>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: active ? 700 : 500 }}>{label}</span>
      <span style={{ height: 3, width: 22, borderRadius: 3, marginTop: 1, background: active ? accent : "transparent" }} />
    </button>
  );
}

/* ---------- shopping view ---------- */
function ShopView({ items, learned, onLearn, onAdd, onBuy, onRemove, onQty }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("veg");
  const [qty, setQty] = useState(1);
  const [manual, setManual] = useState(false); // user overrode the auto pick
  const [auto, setAuto] = useState(false); // current cat came from detection
  const [fromMemory, setFromMemory] = useState(false); // pick came from a learned correction
  const [showCats, setShowCats] = useState(false); // category picker expanded

  const handleName = (val) => {
    setName(val);
    if (manual) return; // respect manual choice until reset
    const key = val.trim();
    if (key && learned[key]) {
      setCat(learned[key]);
      setAuto(true);
      setFromMemory(true);
      return;
    }
    const d = detectCat(val);
    if (d) {
      setCat(d);
      setAuto(true);
      setFromMemory(false);
    } else if (!key) {
      setAuto(false);
      setFromMemory(false);
    }
  };

  const pickCat = (key) => {
    setCat(key);
    setManual(true);
    setAuto(false);
    setFromMemory(false);
  };

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    // remember a manual correction so next time this item auto-fills correctly
    if (manual) onLearn(n, cat);
    onAdd(n, cat, qty);
    setName("");
    setQty(1);
    setManual(false);
    setAuto(false);
    setFromMemory(false);
    setShowCats(false);
    setCat("veg");
  };

  const grouped = useMemo(() => {
    const map = {};
    items.forEach((i) => (map[i.cat] = map[i.cat] || []).push(i));
    return CATEGORIES.filter((c) => map[c.key]).map((c) => ({ cat: c, list: map[c.key] }));
  }, [items]);

  return (
    <div>
      <div style={{ ...styles.card, padding: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={name}
            onChange={(e) => handleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="要買什麼？"
            style={styles.input}
          />
          <div style={styles.stepper}>
            <button className="gf-tap" onClick={() => setQty((q) => Math.max(1, q - 1))} style={styles.stepBtn}>
              <Minus size={15} />
            </button>
            <span style={styles.stepVal}>{qty}</span>
            <button className="gf-tap" onClick={() => setQty((q) => q + 1)} style={styles.stepBtn}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* collapsible category picker */}
        <div style={styles.catControl}>
          <button className="gf-tap" onClick={() => setShowCats((s) => !s)} style={styles.catToggle}>
            <span style={styles.catCurrent}>
              <span style={{ fontSize: 16 }}>{catOf(cat).emoji}</span>
              {catOf(cat).label}
            </span>
            <span style={{ ...styles.catStatus, color: auto ? C.buy : C.muted }}>
              {auto ? (fromMemory ? "🧠 記住的" : "✨ 自動") : "手動選"}
            </span>
            <ChevronDown
              size={17}
              color={C.muted}
              style={{ transform: showCats ? "rotate(180deg)" : "none", transition: "transform .2s ease", flexShrink: 0 }}
            />
          </button>

          {showCats && (
            <div style={styles.catGrid}>
              {CATEGORIES.map((c) => {
                const on = cat === c.key;
                return (
                  <button
                    key={c.key}
                    className="gf-tap"
                    onClick={() => {
                      pickCat(c.key);
                      setShowCats(false);
                    }}
                    style={{
                      ...styles.chip,
                      background: on ? C.buySoft : "#F2F3EE",
                      borderColor: on ? C.buy : "transparent",
                      color: on ? "#B23C22" : C.muted,
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          className="gf-tap"
          onClick={submit}
          disabled={!name.trim()}
          style={{ ...styles.addBtn, background: name.trim() ? C.buy : "#DDDED8" }}
        >
          <Plus size={18} strokeWidth={2.6} /> 加入清單
        </button>
      </div>

      {items.length === 0 ? (
        <Empty emoji="🧺" title="清單是空的" text="把想買的東西加進來，逛市場時一項一項勾掉。" />
      ) : (
        grouped.map(({ cat, list }) => (
          <div key={cat.key} style={{ marginTop: 18 }}>
            <div style={styles.groupHead}>
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span style={styles.groupCount}>{list.length}</span>
            </div>
            {list.map((it) => (
              <ShopRow key={it.id} item={it} onBuy={onBuy} onRemove={onRemove} onQty={onQty} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function ShopRow({ item, onBuy, onRemove, onQty }) {
  return (
    <div style={styles.row} className="gf-row">
      <button className="gf-tap" onClick={() => onBuy(item)} style={styles.checkBtn} aria-label="買到了">
        <Check size={16} strokeWidth={3} color="#fff" />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.rowName}>{item.name}</div>
        <div style={styles.rowMeta}>買到後勾一下 → 放進冰箱</div>
      </div>
      <div style={styles.qtyMini}>
        <button className="gf-tap" onClick={() => onQty(item.id, -1)} style={styles.qtyMiniBtn}>
          <Minus size={13} />
        </button>
        <span style={styles.qtyMiniVal}>{item.qty}</span>
        <button className="gf-tap" onClick={() => onQty(item.id, 1)} style={styles.qtyMiniBtn}>
          <Plus size={13} />
        </button>
      </div>
      <button className="gf-tap" onClick={() => onRemove(item.id)} style={styles.ghostBtn} aria-label="刪除">
        <X size={16} color={C.muted} />
      </button>
    </div>
  );
}

/* ---------- fridge view ---------- */
function FridgeView({ items, expiredCount, soonCount, onUseUp, onBack, onQty, onMove, onAddManual }) {
  const [view, setView] = useState("chill");
  const chill = items.filter((i) => i.store !== "freeze");
  const freeze = items.filter((i) => i.store === "freeze");
  const shown = view === "freeze" ? freeze : chill;

  return (
    <div>
      {(expiredCount > 0 || soonCount > 0) && (
        <div
          style={{
            ...styles.alertBar,
            background: expiredCount ? C.dangerSoft : "#FEF3DA",
            borderColor: expiredCount ? "#F6C9C6" : "#F5E2B8",
          }}
        >
          <div style={{ fontSize: 20 }}>{expiredCount ? "⚠️" : "⏰"}</div>
          <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 500, lineHeight: 1.4 }}>
            {expiredCount > 0 && <span style={{ color: C.danger, fontWeight: 700 }}>{expiredCount} 項已過期</span>}
            {expiredCount > 0 && soonCount > 0 && "、"}
            {soonCount > 0 && <span style={{ color: "#B7791F", fontWeight: 700 }}>{soonCount} 項快過期</span>}
            <span style={{ color: C.muted }}>　趕快處理掉吧</span>
          </div>
        </div>
      )}

      {/* 冷藏 / 冷凍 segmented control */}
      <div style={styles.segment}>
        {[
          { key: "chill", label: "冷藏", n: chill.length, color: C.fresh },
          { key: "freeze", label: "冷凍", n: freeze.length, color: C.frost },
        ].map((s) => (
          <button
            key={s.key}
            className="gf-tap"
            onClick={() => setView(s.key)}
            style={{
              ...styles.segBtn,
              background: view === s.key ? "#fff" : "transparent",
              color: view === s.key ? s.color : C.muted,
              boxShadow: view === s.key ? "0 1px 3px rgba(20,40,30,0.1)" : "none",
              fontWeight: view === s.key ? 700 : 500,
            }}
          >
            {s.key === "freeze" ? "❄️" : "🧊"} {s.label}
            <span style={{ ...styles.segCount, color: view === s.key ? s.color : C.muted }}>{s.n}</span>
          </button>
        ))}
      </div>

      <button className="gf-tap" onClick={() => onAddManual(view)} style={styles.addFridgeBtn}>
        <Plus size={17} strokeWidth={2.6} /> 直接加入{view === "freeze" ? "冷凍" : "冷藏"}
      </button>

      {shown.length === 0 ? (
        <Empty
          emoji={view === "freeze" ? "❄️" : "🧊"}
          title={view === "freeze" ? "冷凍庫是空的" : "冷藏室是空的"}
          text="按上面「直接加入」放進現有食材，或到「買菜」勾選買到的東西，就會出現在這裡。"
        />
      ) : (
        <div style={{ marginTop: 4 }}>
          {shown.map((it) => (
            <FridgeCard key={it.id} item={it} onUseUp={onUseUp} onBack={onBack} onQty={onQty} onMove={onMove} />
          ))}
        </div>
      )}
    </div>
  );
}

function FridgeCard({ item, onUseUp, onBack, onQty, onMove }) {
  const f = freshness(item.expiry);
  const cat = catOf(item.cat);
  return (
    <div style={{ ...styles.card, ...styles.fridgeCard, borderLeft: `4px solid ${f.color}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={styles.catBadge}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.rowName}>{item.name}</div>
          <div style={styles.ticket}>
            <span>到期 {fmtDate(item.expiry)}</span>
            <span style={{ color: C.line }}>·</span>
            <span>入 {fmtDate(item.added)}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div
            style={{
              ...styles.statusPill,
              color: f.color,
              background: f.key === "expired" ? C.dangerSoft : f.key === "soon" ? "#FEF3DA" : C.freshSoft,
            }}
          >
            {f.label}
          </div>
          <div style={styles.miniSwitch}>
            {[
              { key: "chill", label: "冷藏", emoji: "🧊", color: C.fresh },
              { key: "freeze", label: "冷凍", emoji: "❄️", color: C.frost },
            ].map((s) => {
              const on = (item.store === "freeze") === (s.key === "freeze");
              return (
                <button
                  key={s.key}
                  className="gf-tap"
                  onClick={() => onMove(item.id, s.key)}
                  style={{
                    ...styles.miniSeg,
                    background: on ? "#fff" : "transparent",
                    color: on ? s.color : C.muted,
                    boxShadow: on ? "0 1px 2px rgba(20,40,30,0.12)" : "none",
                  }}
                >
                  {s.emoji} {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.meterTrack}>
        <div style={{ ...styles.meterFill, width: `${Math.max(6, f.ratio * 100)}%`, background: f.color }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <div style={styles.qtyMini}>
          <button className="gf-tap" onClick={() => onQty(item.id, -1)} style={styles.qtyMiniBtn}>
            <Minus size={13} />
          </button>
          <span style={styles.qtyMiniVal}>{item.qty}</span>
          <button className="gf-tap" onClick={() => onQty(item.id, 1)} style={styles.qtyMiniBtn}>
            <Plus size={13} />
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <button className="gf-tap" onClick={() => onBack(item)} style={styles.softBtn}>
          <RotateCcw size={14} /> 要補貨
        </button>
        <button className="gf-tap" onClick={() => onUseUp(item.id)} style={styles.softBtnGreen}>
          <Check size={14} /> 用完了
        </button>
      </div>
    </div>
  );
}

/* ---------- expiry bottom sheet ---------- */
function ExpirySheet({ item, onCancel, onConfirm }) {
  const cat = catOf(item.cat);
  const [store, setStore] = useState("chill");

  const chillPresets = [
    { label: "3 天", days: 3 },
    { label: "1 週", days: 7 },
    { label: "2 週", days: 14 },
    { label: "1 個月", days: 30 },
  ];
  const freezePresets = [
    { label: "2 週", days: 14 },
    { label: "1 個月", days: 30 },
    { label: "3 個月", days: 90 },
    { label: "6 個月", days: 180 },
  ];
  const presets = store === "freeze" ? freezePresets : chillPresets;

  const smart =
    store === "freeze"
      ? freezePresets[2] // 冷凍預設建議 3 個月
      : chillPresets.reduce((best, p) =>
          Math.abs(p.days - cat.life) < Math.abs(best.days - cat.life) ? p : best
        );

  const [mode, setMode] = useState(smart.days);
  const [customDate, setCustomDate] = useState(addDays(cat.life));

  // when switching store, snap to that store's recommended preset
  const switchStore = (s) => {
    setStore(s);
    const rec = s === "freeze" ? freezePresets[2] : chillPresets.reduce((best, p) =>
      Math.abs(p.days - cat.life) < Math.abs(best.days - cat.life) ? p : best
    );
    setMode(rec.days);
  };

  const finalDate = mode === "custom" ? customDate : addDays(mode);

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.sheet} className="gf-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ ...styles.catBadge, fontSize: 22 }}>{cat.emoji}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>{item.name}</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>放進冰箱 · 選存放位置與保存期限</div>
          </div>
        </div>

        {/* store toggle */}
        <div style={styles.storeToggle}>
          {[
            { key: "chill", label: "冷藏", emoji: "🧊", color: C.fresh, soft: C.freshSoft },
            { key: "freeze", label: "冷凍", emoji: "❄️", color: C.frost, soft: C.frostSoft },
          ].map((s) => (
            <button
              key={s.key}
              className="gf-tap"
              onClick={() => switchStore(s.key)}
              style={{
                ...styles.storeOpt,
                background: store === s.key ? s.soft : "#fff",
                borderColor: store === s.key ? s.color : C.line,
                color: store === s.key ? s.color : C.muted,
                fontWeight: store === s.key ? 700 : 500,
              }}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        <div style={styles.presetGrid}>
          {presets.map((p) => (
            <button
              key={p.days}
              className="gf-tap"
              onClick={() => setMode(p.days)}
              style={{
                ...styles.preset,
                borderColor: mode === p.days ? C.fresh : C.line,
                background: mode === p.days ? C.freshSoft : "#fff",
                color: mode === p.days ? "#1D4ED8" : C.ink,
                fontWeight: mode === p.days ? 700 : 500,
              }}
            >
              {p.label}
              {p.days === smart.days && <span style={styles.recommend}>建議</span>}
            </button>
          ))}
        </div>

        <button
          className="gf-tap"
          onClick={() => setMode("custom")}
          style={{
            ...styles.customToggle,
            borderColor: mode === "custom" ? C.fresh : C.line,
            background: mode === "custom" ? C.freshSoft : "#fff",
          }}
        >
          <span style={{ color: mode === "custom" ? "#1D4ED8" : C.muted, fontWeight: mode === "custom" ? 700 : 500 }}>
            自訂日期
          </span>
          <input
            type="date"
            value={customDate}
            min={todayStr()}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setMode("custom");
            }}
            onClick={(e) => e.stopPropagation()}
            style={styles.dateInput}
          />
        </button>

        <div style={styles.previewLine}>
          到期日 <b style={{ color: C.fresh, fontFamily: "'Space Mono', monospace" }}>{fmtDate(finalDate)}</b>
          <span style={{ color: C.muted }}>（{Math.max(0, daysUntil(finalDate))} 天後）</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="gf-tap" onClick={onCancel} style={styles.cancelBtn}>
            取消
          </button>
          <button
            className="gf-tap"
            onClick={() => onConfirm(item, finalDate, store)}
            style={{ ...styles.confirmBtn, background: store === "freeze" ? C.frost : C.fresh }}
          >
            {store === "freeze" ? <Snowflake size={18} /> : <Refrigerator size={18} />}
            放進{store === "freeze" ? "冷凍" : "冷藏"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- add directly to fridge (existing / non-purchased food) ---------- */
function AddFridgeSheet({ defaultStore, learned, onLearn, onCancel, onConfirm }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("veg");
  const [qty, setQty] = useState(1);
  const [manual, setManual] = useState(false);
  const [auto, setAuto] = useState(false);
  const [fromMemory, setFromMemory] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [store, setStore] = useState(defaultStore || "chill");
  const [mode, setMode] = useState(null); // null = follow recommended; number = preset days; "custom"
  const [customDate, setCustomDate] = useState("");

  const catObj = catOf(cat);
  const presets = store === "freeze" ? FREEZE_PRESETS : CHILL_PRESETS;
  const rec = recommendPreset(catObj, store);
  const finalDate = mode === "custom" ? customDate || addDays(rec.days) : addDays(mode == null ? rec.days : mode);

  const handleName = (val) => {
    setName(val);
    if (manual) return;
    const key = val.trim();
    if (key && learned[key]) {
      setCat(learned[key]);
      setAuto(true);
      setFromMemory(true);
      return;
    }
    const d = detectCat(val);
    if (d) {
      setCat(d);
      setAuto(true);
      setFromMemory(false);
    } else if (!key) {
      setAuto(false);
      setFromMemory(false);
    }
  };
  const pickCat = (key) => {
    setCat(key);
    setManual(true);
    setAuto(false);
    setFromMemory(false);
    setShowCats(false);
  };
  const switchStore = (s) => {
    setStore(s);
    setMode(null);
  };

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (manual) onLearn(n, cat);
    onConfirm({ name: n, cat, qty, store, expiry: finalDate });
  };

  const presetActive = (p) => (mode == null ? p.days === rec.days : mode === p.days);

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={{ ...styles.sheet, maxHeight: "88vh", overflowY: "auto" }} className="gf-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>直接加入冰箱</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1 }}>家裡現有、別人送的、自己做的食材都可以</div>
        </div>

        {/* name + qty */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={name}
            onChange={(e) => handleName(e.target.value)}
            placeholder="食材名稱"
            autoFocus
            style={styles.input}
          />
          <div style={styles.stepper}>
            <button className="gf-tap" onClick={() => setQty((q) => Math.max(1, q - 1))} style={styles.stepBtn}>
              <Minus size={15} />
            </button>
            <span style={styles.stepVal}>{qty}</span>
            <button className="gf-tap" onClick={() => setQty((q) => q + 1)} style={styles.stepBtn}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* collapsible category */}
        <div style={styles.catControl}>
          <button className="gf-tap" onClick={() => setShowCats((s) => !s)} style={styles.catToggle}>
            <span style={styles.catCurrent}>
              <span style={{ fontSize: 16 }}>{catObj.emoji}</span>
              {catObj.label}
            </span>
            <span style={{ ...styles.catStatus, color: auto ? C.buy : C.muted }}>
              {auto ? (fromMemory ? "🧠 記住的" : "✨ 自動") : "手動選"}
            </span>
            <ChevronDown
              size={17}
              color={C.muted}
              style={{ transform: showCats ? "rotate(180deg)" : "none", transition: "transform .2s ease", flexShrink: 0 }}
            />
          </button>
          {showCats && (
            <div style={styles.catGrid}>
              {CATEGORIES.map((c) => {
                const on = cat === c.key;
                return (
                  <button
                    key={c.key}
                    className="gf-tap"
                    onClick={() => pickCat(c.key)}
                    style={{
                      ...styles.chip,
                      background: on ? C.buySoft : "#F2F3EE",
                      borderColor: on ? C.buy : "transparent",
                      color: on ? "#B23C22" : C.muted,
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    <span style={{ marginRight: 4 }}>{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* store toggle */}
        <div style={{ ...styles.storeToggle, marginTop: 12 }}>
          {[
            { key: "chill", label: "冷藏", emoji: "🧊", color: C.fresh, soft: C.freshSoft },
            { key: "freeze", label: "冷凍", emoji: "❄️", color: C.frost, soft: C.frostSoft },
          ].map((s) => (
            <button
              key={s.key}
              className="gf-tap"
              onClick={() => switchStore(s.key)}
              style={{
                ...styles.storeOpt,
                background: store === s.key ? s.soft : "#fff",
                borderColor: store === s.key ? s.color : C.line,
                color: store === s.key ? s.color : C.muted,
                fontWeight: store === s.key ? 700 : 500,
              }}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* expiry presets */}
        <div style={styles.presetGrid}>
          {presets.map((p) => {
            const on = presetActive(p);
            return (
              <button
                key={p.days}
                className="gf-tap"
                onClick={() => setMode(p.days)}
                style={{
                  ...styles.preset,
                  borderColor: on ? C.fresh : C.line,
                  background: on ? C.freshSoft : "#fff",
                  color: on ? "#1D4ED8" : C.ink,
                  fontWeight: on ? 700 : 500,
                }}
              >
                {p.label}
                {p.days === rec.days && <span style={styles.recommend}>建議</span>}
              </button>
            );
          })}
        </div>

        <button
          className="gf-tap"
          onClick={() => {
            if (!customDate) setCustomDate(addDays(rec.days));
            setMode("custom");
          }}
          style={{
            ...styles.customToggle,
            borderColor: mode === "custom" ? C.fresh : C.line,
            background: mode === "custom" ? C.freshSoft : "#fff",
          }}
        >
          <span style={{ color: mode === "custom" ? "#1D4ED8" : C.muted, fontWeight: mode === "custom" ? 700 : 500 }}>
            自訂日期
          </span>
          <input
            type="date"
            value={customDate || addDays(rec.days)}
            min={todayStr()}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setMode("custom");
            }}
            onClick={(e) => e.stopPropagation()}
            style={styles.dateInput}
          />
        </button>

        <div style={styles.previewLine}>
          到期日 <b style={{ color: C.fresh, fontFamily: "'Space Mono', monospace" }}>{fmtDate(finalDate)}</b>
          <span style={{ color: C.muted }}>（{Math.max(0, daysUntil(finalDate))} 天後）</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="gf-tap" onClick={onCancel} style={styles.cancelBtn}>
            取消
          </button>
          <button
            className="gf-tap"
            onClick={save}
            disabled={!name.trim()}
            style={{
              ...styles.confirmBtn,
              background: !name.trim() ? "#DDDED8" : store === "freeze" ? C.frost : C.fresh,
            }}
          >
            {store === "freeze" ? <Snowflake size={18} /> : <Refrigerator size={18} />}
            加入{store === "freeze" ? "冷凍" : "冷藏"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- meal records ---------- */
function MealsView({ meals, onAdd, onDelete }) {
  return (
    <div>
      <button className="gf-tap" onClick={onAdd} style={styles.addMealBtn}>
        <Camera size={18} strokeWidth={2.4} /> 記一餐
      </button>

      {meals.length === 0 ? (
        <Empty
          emoji="🍳"
          title="還沒有料理紀錄"
          text="拍下你煮的菜、記錄用了哪些食材，之後沒靈感時就能回來翻一翻。"
        />
      ) : (
        <div style={styles.mealGrid}>
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function MealCard({ meal, onDelete }) {
  const [photo, setPhoto] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const delTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    if (meal.hasPhoto) {
      (async () => {
        try {
          const r = await window.storage.get(photoKey(meal.id));
          if (alive && r && r.value) setPhoto(r.value);
        } catch (e) {
          /* photo missing */
        }
      })();
    }
    return () => {
      alive = false;
    };
  }, [meal.id, meal.hasPhoto]);

  const tapDelete = () => {
    if (confirmDel) {
      clearTimeout(delTimer.current);
      onDelete(meal.id);
    } else {
      setConfirmDel(true);
      delTimer.current = setTimeout(() => setConfirmDel(false), 2500);
    }
  };

  return (
    <div style={styles.mealCard}>
      <div style={styles.mealPhotoWrap}>
        {photo ? (
          <img src={photo} alt={meal.name} style={styles.mealPhoto} />
        ) : (
          <div style={styles.mealPhotoEmpty}>{meal.hasPhoto ? "🖼️" : "🍽️"}</div>
        )}
        <button
          className="gf-tap"
          onClick={tapDelete}
          style={{
            ...styles.mealDelBtn,
            background: confirmDel ? C.danger : "rgba(23,38,63,0.55)",
            width: confirmDel ? "auto" : 26,
            padding: confirmDel ? "0 9px" : 0,
          }}
        >
          {confirmDel ? <span style={{ fontSize: 11, fontWeight: 700 }}>刪除？</span> : <Trash2 size={13} color="#fff" />}
        </button>
      </div>
      <div style={styles.mealBody}>
        <div style={styles.mealName}>{meal.name}</div>
        <div style={styles.mealDate}>{fmtDate(meal.date)}</div>
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div style={styles.ingChipsWrap}>
            {meal.ingredients.map((ing, i) => (
              <span key={i} style={styles.ingChipView}>
                {ing}
              </span>
            ))}
          </div>
        )}
        {meal.note ? <div style={styles.mealNote}>{meal.note}</div> : null}
      </div>
    </div>
  );
}

function AddMealSheet({ fridgeItems, onCancel, onConfirm }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayStr());
  const [ings, setIngs] = useState([]);
  const [ingInput, setIngInput] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectDone, setDetectDone] = useState(false);
  const [detectErr, setDetectErr] = useState(null);
  const [others, setOthers] = useState([]); // ingredients seen in photo, not in fridge
  const fileRef = useRef(null);

  const fridgeNames = [...new Set(fridgeItems.map((i) => i.name))];

  const detectIngredients = async (dataUrl) => {
    setDetecting(true);
    setDetectErr(null);
    setDetectDone(false);
    setOthers([]);
    try {
      const b64 = dataUrl.split(",")[1];
      const prompt =
        "你是食材辨識助手。以下是使用者冰箱裡現有的食材清單（候選）：\n" +
        (fridgeNames.join("、") || "（空）") +
        "\n\n請看這張料理照片，判斷：\n" +
        "1. matched：上面候選清單中，有哪些食材出現在或被用在這道菜裡（只能從候選清單挑，字串要與清單完全一致）\n" +
        "2. others：照片中你看到、但不在候選清單裡的其他明顯食材（用繁體中文簡短名稱，最多 6 個）\n\n" +
        '只回傳 JSON，不要任何多餘文字或 markdown：\n{"matched":["..."],"others":["..."]}';

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        setDetectErr("尚未設定 API 金鑰，請手動加入食材");
        setDetecting(false);
        return;
      }
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_ANTHROPIC_MODEL || "claude-sonnet-5",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
                { type: "text", text: prompt },
              ],
            },
          ],
        }),
      });
      const data = await resp.json();
      const raw = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(raw);
      const matched = (parsed.matched || []).filter((m) => fridgeNames.includes(m));
      setIngs((prev) => [...new Set([...prev, ...matched])]);
      const extra = (parsed.others || []).filter((o) => o && !fridgeNames.includes(o));
      setOthers(extra);
      setDetectDone(true);
    } catch (err) {
      setDetectErr("辨識失敗，請手動加入食材");
    }
    setDetecting(false);
  };

  const pickPhoto = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    setDetectDone(false);
    setDetectErr(null);
    setOthers([]);
    try {
      const d = await compressImage(f);
      setPhoto(d);
      detectIngredients(d); // auto-detect from the photo
    } catch (err) {
      /* ignore */
    }
    setBusy(false);
  };

  const addIng = (val) => {
    const v = (val != null ? val : ingInput).trim();
    if (!v) return;
    if (!ings.includes(v)) setIngs((a) => [...a, v]);
    setIngInput("");
    setOthers((o) => o.filter((x) => x !== v));
  };
  const removeIng = (v) => setIngs((a) => a.filter((x) => x !== v));

  const fridgeSuggest = [...new Set(fridgeItems.map((i) => i.name))]
    .filter((n) => !ings.includes(n))
    .slice(0, 12);

  const save = () => {
    if (!name.trim()) return;
    onConfirm({ name: name.trim(), date, ingredients: ings, note: note.trim(), photo });
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={{ ...styles.sheet, maxHeight: "90vh", overflowY: "auto" }} className="gf-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={styles.sheetHandle} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>記一餐</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1 }}>拍照 · 記下菜名和用到的食材</div>
        </div>

        {/* photo */}
        <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: "none" }} />
        <button className="gf-tap" onClick={() => fileRef.current && fileRef.current.click()} style={styles.photoPick}>
          {photo ? (
            <img src={photo} alt="preview" style={styles.photoPreview} />
          ) : (
            <div style={{ textAlign: "center", color: C.muted }}>
              <ImagePlus size={30} color={C.buy} />
              <div style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>{busy ? "處理中…" : "加照片（拍照或選圖）"}</div>
            </div>
          )}
          {photo && <span style={styles.photoChange}>更換</span>}
        </button>

        {/* AI detection status */}
        {photo && (
          <div style={styles.detectRow}>
            {detecting ? (
              <span style={{ color: C.fresh, fontWeight: 600 }}>✨ 辨識照片中的食材…</span>
            ) : detectErr ? (
              <span style={{ color: C.danger }}>{detectErr}</span>
            ) : detectDone ? (
              <span style={{ color: C.muted }}>✨ 已帶入辨識到的食材，請確認</span>
            ) : (
              <span style={{ color: C.muted }}>&nbsp;</span>
            )}
            {!detecting && (
              <button className="gf-tap" onClick={() => detectIngredients(photo)} style={styles.reDetect}>
                重新辨識
              </button>
            )}
          </div>
        )}

        {/* name */}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="菜名（例如：番茄炒蛋）" style={{ ...styles.input, marginTop: 12, width: "100%" }} />

        {/* date */}
        <div style={styles.mealDateRow}>
          <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>日期</span>
          <input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} style={styles.dateInput} />
        </div>

        {/* ingredients */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 14, color: C.ink, fontWeight: 700, marginBottom: 8 }}>用到的食材</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={ingInput}
              onChange={(e) => setIngInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIng()}
              placeholder="輸入食材後按 +"
              style={{ ...styles.input, flex: 1 }}
            />
            <button className="gf-tap" onClick={() => addIng()} disabled={!ingInput.trim()} style={{ ...styles.ingAddBtn, background: ingInput.trim() ? C.buy : "#DDDED8" }}>
              <Plus size={18} strokeWidth={2.6} color="#fff" />
            </button>
          </div>

          {ings.length > 0 && (
            <div style={{ ...styles.ingChipsWrap, marginTop: 10 }}>
              {ings.map((v) => (
                <span key={v} style={styles.ingChipEdit}>
                  {v}
                  <button className="gf-tap" onClick={() => removeIng(v)} style={styles.ingChipX}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>照片中可能還有（點選加入）：</div>
              <div style={styles.ingChipsWrap}>
                {others.map((n) => (
                  <button key={n} className="gf-tap" onClick={() => addIng(n)} style={styles.ingSuggestAI}>
                    ✨ + {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fridgeSuggest.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>從冰箱快速加入：</div>
              <div style={styles.ingChipsWrap}>
                {fridgeSuggest.map((n) => (
                  <button key={n} className="gf-tap" onClick={() => addIng(n)} style={styles.ingSuggest}>
                    + {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註（做法、味道、下次想調整的地方…）"
          rows={2}
          style={styles.textarea}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="gf-tap" onClick={onCancel} style={styles.cancelBtn}>
            取消
          </button>
          <button
            className="gf-tap"
            onClick={save}
            disabled={!name.trim()}
            style={{ ...styles.confirmBtn, background: !name.trim() ? "#DDDED8" : C.buy }}
          >
            <Check size={18} strokeWidth={2.6} /> 儲存
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- empty state ---------- */
function Empty({ emoji, title, text }) {
  return (
    <div style={styles.empty}>
      <div style={{ fontSize: 44, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 13.5, color: C.muted, marginTop: 6, maxWidth: 250, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

/* ---------- injected CSS ---------- */
function StyleTag() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      input, button { font-family: inherit; }
      input:focus-visible, button:focus-visible { outline: 2px solid ${C.fresh}; outline-offset: 2px; }
      .gf-tap { cursor: pointer; transition: transform .08s ease, opacity .15s ease; }
      .gf-tap:active { transform: scale(0.96); }
      .gf-row { transition: background .15s ease; }
      .gf-scroll { overflow-x: auto; scrollbar-width: none; }
      .gf-scroll::-webkit-scrollbar { display: none; }
      .gf-toast { animation: gfToastIn .25s ease; }
      .gf-sheet { animation: gfSheetUp .28s cubic-bezier(.2,.8,.2,1); }
      @keyframes gfToastIn { from { opacity: 0; transform: translate(-50%, 12px);} to {opacity:1; transform: translate(-50%,0);} }
      @keyframes gfSheetUp { from { transform: translateY(100%);} to { transform: translateY(0);} }
      @keyframes gfPulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(214,79,58,.5);} 50%{ box-shadow: 0 0 0 5px rgba(214,79,58,0);} }
      .gf-pulse { animation: gfPulse 1.8s infinite; }
      @media (prefers-reduced-motion: reduce) {
        .gf-tap, .gf-toast, .gf-sheet, .gf-pulse { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}

/* ---------- styles ---------- */
const styles = {
  app: {
    fontFamily: "'Noto Sans TC', system-ui, sans-serif",
    background: C.bg,
    color: C.ink,
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 84,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "16px 18px 12px",
    position: "sticky",
    top: 0,
    background: C.bg,
    zIndex: 5,
  },
  brandMark: {
    width: 38, height: 38, borderRadius: 11, background: C.freshSoft,
    display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.line}`,
  },
  brandName: { fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" },
  brandSub: { fontSize: 11.5, color: C.muted, marginTop: 1 },
  main: { padding: "4px 16px 20px" },

  card: { background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(20,40,30,0.03)" },
  input: {
    flex: 1, minWidth: 0, border: `1px solid ${C.line}`, borderRadius: 11,
    padding: "11px 13px", fontSize: 15.5, background: "#FBFCF9", color: C.ink,
  },
  stepper: { display: "flex", alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 11, background: "#FBFCF9", overflow: "hidden" },
  stepBtn: { border: "none", background: "transparent", padding: "0 9px", height: "100%", color: C.muted, display: "flex", alignItems: "center" },
  stepVal: { minWidth: 22, textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700 },
  catControl: { marginTop: 12 },
  catToggle: {
    width: "100%", display: "flex", alignItems: "center", gap: 8,
    border: `1px solid ${C.line}`, borderRadius: 11, background: "#FBFCF9",
    padding: "10px 12px", fontSize: 14.5,
  },
  catCurrent: { display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: C.ink },
  catStatus: { marginLeft: "auto", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  catGrid: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 },
  chip: { flex: "0 0 auto", border: "1.5px solid transparent", borderRadius: 999, padding: "7px 12px", fontSize: 13, whiteSpace: "nowrap" },
  addBtn: {
    marginTop: 12, width: "100%", border: "none", borderRadius: 12, color: "#fff",
    padding: "12px", fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },

  groupHead: { display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: C.muted, padding: "0 4px 8px" },
  groupCount: { fontFamily: "'Space Mono', monospace", fontSize: 12, background: "#EEF0EA", borderRadius: 999, padding: "1px 8px", color: C.muted },

  row: { display: "flex", alignItems: "center", gap: 11, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 12px", marginBottom: 8 },
  checkBtn: { width: 30, height: 30, borderRadius: 9, border: "none", background: C.buy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowName: { fontSize: 15.5, fontWeight: 500, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowMeta: { fontSize: 11.5, color: C.muted, marginTop: 2 },

  qtyMini: { display: "flex", alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 9, overflow: "hidden", background: "#FBFCF9" },
  qtyMiniBtn: { border: "none", background: "transparent", padding: "5px 7px", color: C.muted, display: "flex", alignItems: "center" },
  qtyMiniVal: { minWidth: 20, textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: 13.5, fontWeight: 700 },
  ghostBtn: { border: "none", background: "transparent", padding: 5, display: "flex", alignItems: "center", flexShrink: 0 },

  segment: { display: "flex", gap: 4, background: "#EDEFE9", borderRadius: 12, padding: 4, marginBottom: 14 },
  segBtn: {
    flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 14.5,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },
  segCount: { fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700 },
  addFridgeBtn: {
    width: "100%", border: `1.5px dashed ${C.line}`, background: "#fff", color: C.fresh,
    borderRadius: 12, padding: "11px", fontSize: 14.5, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12,
  },
  addMealBtn: {
    width: "100%", border: "none", background: C.buy, color: "#fff",
    borderRadius: 12, padding: "12px", fontSize: 15.5, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 14,
  },
  mealGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 },
  mealCard: { background: C.surface, borderRadius: 16, border: `1px solid ${C.line}`, overflow: "hidden", boxShadow: "0 1px 2px rgba(20,40,30,0.03)" },
  mealPhotoWrap: { position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#EEF1F6" },
  mealPhoto: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mealPhotoEmpty: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 },
  mealDelBtn: {
    position: "absolute", top: 7, right: 7, height: 26, borderRadius: 999, border: "none",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
  },
  mealBody: { padding: "9px 10px 11px" },
  mealName: { fontSize: 14.5, fontWeight: 700, color: C.ink, lineHeight: 1.3 },
  mealDate: { fontSize: 11.5, color: C.muted, fontFamily: "'Space Mono', monospace", marginTop: 2 },
  ingChipsWrap: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 },
  ingChipView: { fontSize: 11, color: "#2F63C4", background: C.freshSoft, borderRadius: 999, padding: "2px 8px", fontWeight: 600 },
  mealNote: { fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.5 },
  photoPick: {
    width: "100%", height: 168, border: `1.5px dashed ${C.line}`, borderRadius: 14, background: "#FAFBFD",
    display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: 0,
  },
  photoPreview: { width: "100%", height: "100%", objectFit: "cover" },
  photoChange: { position: "absolute", bottom: 8, right: 8, background: "rgba(23,38,63,0.6)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 },
  mealDateRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: "0 2px" },
  ingAddBtn: { border: "none", borderRadius: 11, width: 46, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ingChipEdit: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, color: C.ink, background: "#EEF1F6", borderRadius: 999, padding: "4px 6px 4px 11px", fontWeight: 600 },
  ingChipX: { border: "none", background: "transparent", display: "flex", alignItems: "center", color: C.muted, padding: 2 },
  ingSuggest: { border: `1px solid ${C.line}`, background: "#fff", color: C.buy, borderRadius: 999, padding: "5px 11px", fontSize: 12.5, fontWeight: 600 },
  ingSuggestAI: { border: `1px solid ${C.fresh}`, background: C.freshSoft, color: "#2F63C4", borderRadius: 999, padding: "5px 11px", fontSize: 12.5, fontWeight: 700 },
  detectRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12.5, padding: "8px 2px 0", minHeight: 20 },
  reDetect: { border: "none", background: "transparent", color: C.fresh, fontSize: 12.5, fontWeight: 700, textDecoration: "underline", flexShrink: 0 },
  textarea: {
    width: "100%", marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px",
    fontSize: 14.5, background: "#FBFCF9", color: C.ink, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5,
  },

  fridgeCard: { padding: "13px 14px", marginBottom: 10 },
  catBadge: { width: 34, height: 34, borderRadius: 10, background: "#F2F4EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  ticket: { display: "flex", gap: 7, marginTop: 3, fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.muted, letterSpacing: "-0.02em" },
  statusPill: { fontSize: 12, fontWeight: 700, padding: "4px 9px", borderRadius: 999, whiteSpace: "nowrap", fontFamily: "'Space Mono', monospace" },
  miniSwitch: { display: "inline-flex", background: "#EDEFE9", borderRadius: 999, padding: 3, gap: 2 },
  miniSeg: { border: "none", borderRadius: 999, padding: "5px 9px", fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 2 },
  meterTrack: { height: 5, borderRadius: 3, background: "#EEF0EA", marginTop: 11, overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: 3, transition: "width .3s ease" },
  softBtn: { display: "flex", alignItems: "center", gap: 5, border: `1px solid ${C.line}`, background: "#fff", color: C.muted, borderRadius: 10, padding: "7px 11px", fontSize: 13, fontWeight: 600 },
  softBtnGreen: { display: "flex", alignItems: "center", gap: 5, border: `1px solid ${C.fresh}`, background: C.freshSoft, color: "#1D4ED8", borderRadius: 10, padding: "7px 11px", fontSize: 13, fontWeight: 700 },

  alertBar: { display: "flex", alignItems: "center", gap: 10, border: "1px solid", borderRadius: 13, padding: "11px 13px", marginBottom: 12 },

  tabbar: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480,
    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`,
    display: "flex", padding: "8px 0 max(8px, env(safe-area-inset-bottom))", zIndex: 10,
  },
  tabBtn: { flex: 1, border: "none", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0" },
  tabBadge: {
    position: "absolute", top: -6, right: -10, minWidth: 17, height: 17, borderRadius: 999, color: "#fff",
    fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", fontFamily: "'Space Mono', monospace",
  },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,36,28,0.4)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  sheet: {
    background: C.surface, width: "100%", maxWidth: 480, borderRadius: "22px 22px 0 0",
    padding: "10px 18px max(20px, env(safe-area-inset-bottom))", boxShadow: "0 -8px 30px rgba(20,40,30,0.18)",
  },
  sheetHandle: { width: 38, height: 4, borderRadius: 3, background: C.line, margin: "2px auto 14px" },
  storeToggle: { display: "flex", gap: 9, marginBottom: 4 },
  storeOpt: { flex: 1, border: "1.5px solid", borderRadius: 12, padding: "11px", fontSize: 15, background: "#fff" },
  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 12 },
  preset: { position: "relative", border: "1.5px solid", borderRadius: 13, padding: "13px", fontSize: 15, background: "#fff" },
  recommend: { position: "absolute", top: -8, right: 8, background: C.fresh, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 },
  customToggle: { marginTop: 9, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid", borderRadius: 13, padding: "11px 14px", fontSize: 15, background: "#fff" },
  dateInput: { border: `1px solid ${C.line}`, borderRadius: 9, padding: "6px 8px", fontSize: 13.5, fontFamily: "'Space Mono', monospace", color: C.ink, background: "#FBFCF9" },
  previewLine: { marginTop: 14, textAlign: "center", fontSize: 14, color: C.ink, display: "flex", gap: 6, justifyContent: "center", alignItems: "center" },
  cancelBtn: { flex: "0 0 34%", border: `1px solid ${C.line}`, background: "#fff", borderRadius: 13, padding: "13px", fontSize: 15, fontWeight: 600, color: C.muted },
  confirmBtn: { flex: 1, border: "none", color: "#fff", borderRadius: 13, padding: "13px", fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 },

  empty: { textAlign: "center", padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center" },
  toast: {
    position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff",
    padding: "11px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, zIndex: 60, boxShadow: "0 6px 20px rgba(20,40,30,0.25)", whiteSpace: "nowrap",
  },
};
