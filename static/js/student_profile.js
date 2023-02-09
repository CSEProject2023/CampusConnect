const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const studentContent = document.querySelector(".student-content");

let currentPage = 1;

prevButton.addEventListener("click", function() {
  if (currentPage > 1) {
    currentPage--;
    studentContent.innerHTML = `<h2>Page ${currentPage}</h2><p>Content for Page ${currentPage}</p>`;
  }
});

nextButton.addEventListener("click", function() {
  if (currentPage < 4) {
    currentPage++;
    studentContent.innerHTML = `<h2>Page ${currentPage}</h2><p>Content for Page ${currentPage}</p>`;
  }
});
