document.addEventListener("DOMContentLoaded", () => {

  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.querySelector(".stats-container");
  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");
  const cardStatsContainer = document.querySelector(".stats-cards");

  function validateUsername(username) {
    if (!username.trim()) {
      alert("Username should not be empty");
      return false;
    }

    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    if (!regex.test(username)) {
      alert("Invalid Username");
      return false;
    }

    return true;
  }

 
  async function fetchUserDetails(username) {
    try {
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;
      statsContainer.classList.remove("hidden");

      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://leetcode.com/graphql/";

      const body = JSON.stringify({
        query: `
          query userSessionProgress($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
                totalSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `,
        variables: { username }
      });

      const response = await fetch(proxyUrl + targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      if (!data?.data?.matchedUser) {
        throw new Error("User not found");
      }

      displayUserData(data);

    } catch (error) {
      statsContainer.innerHTML = `<p class="error">${error.message}</p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const percent = total ? (solved / total) * 100 : 0;
    circle.style.setProperty("--progress-degree", `${percent}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(parsedData) {
    const allQuestions = parsedData.data.allQuestionsCount;
    const solved = parsedData.data.matchedUser.submitStats.acSubmissionNum;
    const submissions = parsedData.data.matchedUser.submitStats.totalSubmissionNum;

    updateProgress(solved[1].count, allQuestions[1].count, easyLabel, easyProgressCircle);
    updateProgress(solved[2].count, allQuestions[2].count, mediumLabel, mediumProgressCircle);
    updateProgress(solved[3].count, allQuestions[3].count, hardLabel, hardProgressCircle);

    const cardsData = [
      { label: "Overall Submissions", value: submissions[0].submissions },
      { label: "Easy Submissions", value: submissions[1].submissions },
      { label: "Medium Submissions", value: submissions[2].submissions },
      { label: "Hard Submissions", value: submissions[3].submissions },
    ];

    cardStatsContainer.innerHTML = cardsData
      .map(
        item => `
          <div class="card">
            <h4>${item.label}</h4>
            <p>${item.value}</p>
          </div>
        `
      )
      .join("");
  }

  searchButton.addEventListener("click", () => {
    const username = usernameInput.value;
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });

  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });

});


// Search Button Click
//         ↓
// validateUsername()
//         ↓
// fetchUserDetails()
//         ↓
// displayUserData()
//         ↓
// .stats-cards.innerHTML = <div class="card">...</div>
//         ↓
// Cards UI par dikhte hain ✅
