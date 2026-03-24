const titleScreen = document.getElementById("titleScreen");
const selectScreen = document.getElementById("selectScreen");
const gameScreen = document.getElementById("gameScreen");
const historyScreen = document.getElementById("historyScreen");

const startBtn = document.getElementById("startBtn");
const historyBtn = document.getElementById("historyBtn");
const imageInput = document.getElementById("imageInput");
const nextBtn = document.getElementById("nextBtn");
const preview = document.getElementById("preview");
const puzzle = document.getElementById("puzzle");
const difficulty = document.getElementById("difficulty");
const difficultyText = document.getElementById("difficultyText");

const backToTitleBtn = document.getElementById("backToTitleBtn");
const backToSelectBtn = document.getElementById("backToSelectBtn");
const backFromHistoryBtn = document.getElementById("backFromHistoryBtn");

const hintBtn = document.getElementById("hintBtn");
const hintArea = document.getElementById("hintArea");
const hintImage = document.getElementById("hintImage");

const historyList = document.getElementById("historyList");


const bgm = document.getElementById("bgm");
const clearSe = document.getElementById("clearSe");


let imageSrc = null;
let size = 2;
let tiles = [];
let selected = null;
let hintVisible = false;

// 元画像サイズ
let imageNaturalWidth = 1;
let imageNaturalHeight = 1;

// 盤面サイズ
let puzzleWidth = 320;
let puzzleHeight = 320;

const HISTORY_KEY = "puzzle_history";
//BGM
let bgmStarted = false;

function startBgm() {
  if (bgmStarted) return;

  bgm.volume = 0.3; // 0.0 ～ 1.0
  bgm.play()
    .then(() => {
      bgmStarted = true;
    })
    .catch((error) => {
      console.log("BGM再生失敗:", error);
    });
}


// 画面切り替え
function showScreen(screen) {
  titleScreen.style.display = "none";
  selectScreen.style.display = "none";
  gameScreen.style.display = "none";
  historyScreen.style.display = "none";

  screen.style.display = "block";
}

// タイトル → 画像選択
startBtn.addEventListener("click", () => {
  startBgm();
  showScreen(selectScreen);
  alert("BGM再生を試します");
});

// タイトル → 履歴画面
historyBtn.addEventListener("click", () => {
  renderHistory();
  showScreen(historyScreen);
});

// 画像選択 → タイトルへ戻る
backToTitleBtn.addEventListener("click", () => {
  showScreen(titleScreen);
});

// パズル → 画像選択へ戻る
backToSelectBtn.addEventListener("click", () => {
  hintVisible = false;
  hintArea.style.display = "none";
  hintBtn.textContent = "ヒントを見る";
  showScreen(selectScreen);
});

// 履歴 → タイトルへ戻る
backFromHistoryBtn.addEventListener("click", () => {
  showScreen(titleScreen);
});

// ヒント表示切り替え
hintBtn.addEventListener("click", () => {
  hintVisible = !hintVisible;

  if (hintVisible) {
    hintArea.style.display = "block";
    hintBtn.textContent = "ヒントを閉じる";
  } else {
    hintArea.style.display = "none";
    hintBtn.textContent = "ヒントを見る";
  }
});

// 画像比率に応じて表示サイズを決める
function calculateDisplaySize(imgWidth, imgHeight) {
  const maxLongSide = 420;
  const maxShortSide = 320;

  if (imgWidth === imgHeight) {
    return { width: 320, height: 320 };
  }

  if (imgWidth > imgHeight) {
    const ratio = imgHeight / imgWidth;
    return {
      width: maxLongSide,
      height: Math.round(maxLongSide * ratio)
    };
  }

  const ratio = imgWidth / imgHeight;
  return {
    width: Math.round(maxLongSide * ratio),
    height: maxLongSide
  };
}

// プレビュー・ヒント・盤面サイズ反映
function applyLayoutSizes() {
  preview.style.width = `${puzzleWidth}px`;
  preview.style.height = `${puzzleHeight}px`;

  hintImage.style.width = `${Math.round(puzzleWidth * 0.6)}px`;
  hintImage.style.height = `${Math.round(puzzleHeight * 0.6)}px`;

  puzzle.style.width = `${puzzleWidth}px`;
  puzzle.style.height = `${puzzleHeight}px`;
}

// 画像選択
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      imageSrc = reader.result;
      imageNaturalWidth = img.width;
      imageNaturalHeight = img.height;

      const displaySize = calculateDisplaySize(img.width, img.height);
      puzzleWidth = displaySize.width;
      puzzleHeight = displaySize.height;

      preview.src = imageSrc;
      hintImage.src = imageSrc;

      applyLayoutSizes();

      nextBtn.disabled = false;
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});

// 次へ → パズル開始
nextBtn.addEventListener("click", () => {
  size = parseInt(difficulty.value, 10);
  showScreen(gameScreen);
  initPuzzle();
});

// パズル初期化
function initPuzzle() {
  selected = null;
  hintVisible = false;
  hintArea.style.display = "none";
  hintBtn.textContent = "ヒントを見る";

  createSolvedTiles();
  shuffleUntilNotCleared();
  updateDifficultyText();
  updatePuzzleGrid();
  applyLayoutSizes();
  render();
}

// 正しい並び作成
function createSolvedTiles() {
  tiles = [];
  for (let i = 0; i < size * size; i++) {
    tiles.push(i);
  }
}

// 完成状態にならないようにシャッフル
function shuffleUntilNotCleared() {
  do {
    shuffle();
  } while (isCleared());
}

// シャッフル
function shuffle() {
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
}

// 難易度表示更新
function updateDifficultyText() {
  difficultyText.textContent = `難易度：${size} × ${size}`;
}

// グリッド更新
function updatePuzzleGrid() {
  puzzle.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
}

// 描画
function render() {
  puzzle.innerHTML = "";

  tiles.forEach((num, index) => {
    const div = document.createElement("div");
    div.className = "tile";

    if (selected === index) {
      div.classList.add("selected");
    }

    const x = num % size;
    const y = Math.floor(num / size);

    div.style.backgroundImage = `url(${imageSrc})`;

    // 画像全体を活かす
    div.style.backgroundSize = `${puzzleWidth}px ${puzzleHeight}px`;

    const tileWidth = puzzleWidth / size;
    const tileHeight = puzzleHeight / size;

    div.style.backgroundPosition = `-${x * tileWidth}px -${y * tileHeight}px`;

    div.addEventListener("click", () => selectTile(index));

    puzzle.appendChild(div);
  });
}

// タイル選択
function selectTile(index) {
  if (selected === null) {
    selected = index;
    render();
    return;
  }

  if (selected === index) {
    selected = null;
    render();
    return;
  }

  [tiles[selected], tiles[index]] = [tiles[index], tiles[selected]];
  selected = null;
  render();

if (isCleared()) {
  saveCompletedImage();

  clearSe.currentTime = 0;
  clearSe.volume = 0.6;
  clearSe.play().catch((error) => {
    console.log("クリアSE再生失敗:", error);
  });

  setTimeout(() => {
    alert("完成！");
    showScreen(titleScreen);
  }, 100);
}
}

// クリア判定
function isCleared() {
  return tiles.every((value, index) => value === index);
}

// 完成履歴を保存
function saveCompletedImage() {
  const history = getHistory();

  const item = {
    imageSrc: imageSrc,
    completedAt: new Date().toISOString(),
    size: size,
    width: puzzleWidth,
    height: puzzleHeight
  };

  history.unshift(item);

  const limitedHistory = history.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
}

// 履歴取得
function getHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

// 日付表示用
function formatDate(isoString) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}`;
}

// 履歴描画
function renderHistory() {
  historyList.innerHTML = "";

  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = `<p class="empty-text">まだ完成した思い出がありません</p>`;
    return;
  }

  history.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <img src="${item.imageSrc}" alt="完成画像">
      <div class="history-date">完成日：${formatDate(item.completedAt)}</div>
      <div>難易度：${item.size} × ${item.size}</div>
    `;

    historyList.appendChild(div);
  });
}