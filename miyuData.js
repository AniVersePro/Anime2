// miyuData.js
const miyuAnimeData = [];
const possibleGenres = ["Action", "Horror", "Romance", "Drama", "Comedy"];
const possibleYears = [1999, 2002, 2006, 2010, 2012, 2015, 2019, 2020, 2021, 2022];
const possiblePopularity = ["very popular", "popular", "underrated", "niche"];
const possibleType = ["TV", "Movie", "OVA"];
for (let i = 2000; i <= 2220; i++) {
  const randomYear = possibleYears[Math.floor(Math.random() * possibleYears.length)];
  const randomPop = possiblePopularity[Math.floor(Math.random() * possiblePopularity.length)];
  const randomType = possibleType[Math.floor(Math.random() * possibleType.length)];
  const randomGenre = possibleGenres[Math.floor(Math.random() * possibleGenres.length)];
  miyuAnimeData.push({
    title: "Anime " + i,
    genre: randomGenre,
    year: randomYear,
    popularity: randomPop,
    animeType: randomType,
    description: "This is a brief description for Anime " + i
  });
}
function getWebsiteInfo() {
  return "AniVerse Pro is a next-gen anime streaming platform featuring a vast anime collection, an interactive leaderboard, a coin system, and community features. For technical support, please contact support@aniversepro.com.";
}
window.MiyuGuessingGame = {
  active: false,
  guessCount: 0,
  maxGuesses: 16,
  possibleAnime: [],
  askedAttributes: [],
  currentQuestion: "",
  startGame: function() {
    this.active = true;
    this.guessCount = 0;
    this.askedAttributes = [];
    this.possibleAnime = [...miyuAnimeData];
  },
  getNextQuestion: function() {
    if (this.possibleAnime.length === 1) {
      const guess = this.possibleAnime[0];
      this.active = false;
      return `I've narrowed it down! Is your anime "${guess.title}" from year ${guess.year}?`;
    }
    if (this.guessCount >= this.maxGuesses) {
      this.active = false;
      return "I've run out of questions! Could you tell me more about your anime so I can learn it for next time?";
    }
    const questionPool = ["genre", "year", "popularity", "animeType"];
    let attribute = questionPool[Math.floor(Math.random() * questionPool.length)];
    const freq = {};
    this.possibleAnime.forEach(a => {
      const val = a[attribute];
      freq[val] = (freq[val] || 0) + 1;
    });
    const candidates = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    let chosenValue = null;
    for (let candidate of candidates) {
      if (!this.askedAttributes.includes(attribute + ":" + candidate)) {
        chosenValue = candidate;
        break;
      }
    }
    if (!chosenValue) {
      let found = false;
      for (let attr of questionPool) {
        const freq2 = {};
        this.possibleAnime.forEach(a => {
          const val = a[attr];
          freq2[val] = (freq2[val] || 0) + 1;
        });
        const candidates2 = Object.entries(freq2)
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);
        for (let candidate of candidates2) {
          if (!this.askedAttributes.includes(attr + ":" + candidate)) {
            chosenValue = candidate;
            attribute = attr;
            found = true;
            break;
          }
        }
        if(found) break;
      }
      if (!chosenValue) {
        this.active = false;
        return "I've run out of new questions! Could you share more details about your anime?";
      }
    }
    this.askedAttributes.push(attribute + ":" + chosenValue);
    let questionText = "";
    if (attribute === "genre") {
      questionText = `Is your anime in the ${chosenValue} genre? (yes/no)`;
    } else if (attribute === "year") {
      questionText = `Was your anime released in ${chosenValue}? (yes/no)`;
    } else if (attribute === "popularity") {
      questionText = `Is your anime considered "${chosenValue}"? (yes/no)`;
    } else if (attribute === "animeType") {
      questionText = `Is your anime a ${chosenValue}? (yes/no)`;
    }
    this.currentQuestion = questionText;
    this.guessCount++;
    return questionText;
  },
  processAnswer: function(answer) {
    if (!this.active) {
      return "I'm not currently guessing an anime. Type 'guessing game' to start!";
    }
    answer = answer.trim().toLowerCase();
    if (answer !== "yes" && answer !== "no") {
      return `Please answer with yes or no. ${this.currentQuestion}`;
    }
    const questionLower = this.currentQuestion.toLowerCase();
    let attribute = null;
    let value = null;
    if (questionLower.includes("genre?")) {
      attribute = "genre";
      const genMatch = this.currentQuestion.match(/the (.+) genre/i);
      if (genMatch && genMatch[1]) {
        value = genMatch[1].trim();
      }
    } else if (questionLower.includes("released in")) {
      attribute = "year";
      const yearMatch = this.currentQuestion.match(/released in (\d+)/i);
      if (yearMatch && yearMatch[1]) {
        value = parseInt(yearMatch[1]);
      }
    } else if (questionLower.includes("considered")) {
      attribute = "popularity";
      const popMatch = this.currentQuestion.match(/"(.+)"\?/);
      if (popMatch && popMatch[1]) {
        value = popMatch[1].trim();
      }
    } else if (questionLower.includes("a tv") || questionLower.includes("a movie") || questionLower.includes("an ova")) {
      attribute = "animeType";
      const typeMatch = this.currentQuestion.match(/a (TV|Movie|OVA)/i);
      if (typeMatch && typeMatch[1]) {
        value = typeMatch[1];
      }
    }
    if (!attribute || value === null) {
      return this.getNextQuestion();
    }
    if (answer === "yes") {
      this.possibleAnime = this.possibleAnime.filter(a => a[attribute] === value);
    } else {
      this.possibleAnime = this.possibleAnime.filter(a => a[attribute] !== value);
    }
    return this.getNextQuestion();
  }
};
