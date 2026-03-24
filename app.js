const titleScreen = document.getElementById("titleScreen");
const selectScreen = document.getElementById("selectScreen");
const gameScreen = document.getElementById("gameScreen");

const startBtn = document.getElementById("startBtn");
const imageInput = document.getElementById("imageInput");
const nextBtn = document.getElementById("nextBtn");
const preview = document.getElementById("preview");
const puzzle = document.getElementById("puzzle");
const difficulty = document.getElementById("difficulty");
const difficultyText = document.getElementById("difficultyText");

const backToTitleBtn = document.getElementById("backToTitleBtn");
const backToSelectBtn = document.getElementById("backToSelectBtn");

let imageSrc = null;
let size = 2;
let tiles = [];
let selected = null;

// 画面切り替え
function showScreen(screen) {
  titleScreen.style.display = "none";
  selectScreen.style.display = "none";
  gameScreen.style.display = "none";

  screen.style.display = "block";
}

// タイトル → 画像選択
startBtn.addEventListener("click", () => {
  showScreen(selectScreen);
});

// 画像選択 → タイトルへ戻る
backToTitleBtn.addEventListener("click", () => {
  showScreen(titleScreen);
});

// パズル → 画像選択へ戻る
backToSelectBtn.addEventListener("click", () => {
  showScreen(selectScreen);
});

// 画像選択
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    imageSrc = reader.result;
    preview.src = imageSrc;
    nextBtn.disabled = false;
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
  createSolvedTiles();
  shuffleUntilNotCleared();
  updateDifficultyText();
  updatePuzzleGrid();
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

    // 画像を size × size に応じて分割表示
    div.style.backgroundImage = `url(${imageSrc})`;
    div.style.backgroundSize = `${size * 100}% ${size * 100}%`;

    const posX = size === 1 ? 0 : (x / (size - 1)) * 100;
    const posY = size === 1 ? 0 : (y / (size - 1)) * 100;

    div.style.backgroundPosition = `${posX}% ${posY}%`;

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
    setTimeout(() => {
      alert("完成！");
    }, 100);
  }
}

// クリア判定
function isCleared() {
  return tiles.every((value, index) => value === index);
}