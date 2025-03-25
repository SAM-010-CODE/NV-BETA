






 /* // Button to change body background color
  const changeBodyColorBtn = document.getElementById("changeColorBtn");
  changeBodyColorBtn.addEventListener("click", function() {
    document.body.style.backgroundColor = getRandomColor();
  });

  // Button to change container background color
  const changeContainerColorBtn = document.getElementById("changeContainerColorBtn"); 
  const container = document.querySelector(".container"); // Select the container
  changeContainerColorBtn.addEventListener("click", function() {
    container.style.backgroundColor = getRandomColor();
  });

  const changeTextColorBtn = document.getElementById("changeTextColorBtn");
  const description = document.querySelector(".description");
  changeTextColorBtn.addEventListener("click", function() {
    description.style.color = getRandomColor();
  });


  // Function to generate random color
  function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
*/

const myVisionContainer = document.querySelector('.myvisioncontainer');

// Function to animate myvision preview
window.addEventListener('scroll', () => {
  const containerTop = myVisionContainer.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (containerTop < windowHeight * 0.8) { // Adjust 0.8 to control when the animation starts
    myVisionContainer.classList.add('show');
  } else {
    myVisionContainer.classList.remove('show');
  }
});

const AIcontainer = document.querySelector('.AIcontainer');

// Function to animate myvision preview
window.addEventListener('scroll', () => {
  const containerTop = AIcontainer.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (containerTop < windowHeight * 0.7) { // Adjust 0.8 to control when the animation starts
    AIcontainer.classList.add('show');
  } else {
    AIcontainer.classList.remove('show');
  }
});

    



/*
  const description = document.querySelector('.description');
  const descriptionText = description.textContent;
  description.textContent = "";

  let index = 0;
  const typingInterval = 50; // Adjust the typing speed (milliseconds)

  function typeWriter() {
    if (index < descriptionText.length) {
      description.textContent += descriptionText.charAt(index);
      index++;
      setTimeout(typeWriter, typingInterval);
    }
  }

  typeWriter();
  
*/

  //step 1: get DOM
let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');

let carouselDom = document.querySelector('.carousel');
let SliderDom = carouselDom.querySelector('.carousel .list');
let thumbnailBorderDom = document.querySelector('.carousel .thumbnail');
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
let timeDom = document.querySelector('.carousel .time');

thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
let timeRunning = 3000;
let timeAutoNext = 7000;

nextDom.onclick = function(){
  showSlider('next');    
}

prevDom.onclick = function(){
  showSlider('prev');    
}
let runTimeOut;
let runNextAuto = setTimeout(() => {
  next.click();
}, timeAutoNext)
function showSlider(type){
  let  SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');
  let thumbnailItemsDom = document.querySelectorAll('.carousel .thumbnail .item');
  
  if(type === 'next'){
      SliderDom.appendChild(SliderItemsDom[0]);
      thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
      carouselDom.classList.add('next');
  }else{
      SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
      thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
      carouselDom.classList.add('prev');
  }
  clearTimeout(runTimeOut);
  runTimeOut = setTimeout(() => {
      carouselDom.classList.remove('next');
      carouselDom.classList.remove('prev');
  }, timeRunning);

  clearTimeout(runNextAuto);
  runNextAuto = setTimeout(() => {
      next.click();
  }, timeAutoNext)
}


    // firstpage.js
          
    const autoShow = document.querySelector('.autoShow');
          
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }


    window.addEventListener('scroll', () => {
        if (isInViewport(autoShow)) {
          autoShow.classList.add('show');
        } //No need for an else to remove the class. Let it stay once in view.
    });



// firstpage.js

// ... (your existing isInViewport function and other code) ...

const description1 = document.querySelector('.description1');
const description1Text = description1.textContent;
description1.textContent = ""; // Clear initial content

let typingIndex = 0;
const typingInterval = 50;
let isTyping = false;

function typeWriter() {
  if (typingIndex < description1Text.length) {
      description1.textContent += description1Text.charAt(typingIndex);
      typingIndex++;
      setTimeout(typeWriter, typingInterval);
  } else {
      isTyping = false; 
  }
}

window.addEventListener('scroll', () => {
  if (isInViewport(description1) && !isTyping) {
      isTyping = true;
      typeWriter();
  }
});
















