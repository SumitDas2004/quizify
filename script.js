const main = document.getElementsByTagName("main")[0];

const renderHomePage = () => {
  main.innerHTML = "";
  const topics = [
    "Linux",
    "DevOps",
    "PHP",
    "JavaScript",
    "Docker",
    "Kubernetes",
  ];

  const topicIcons = {
    linux: ["fa-brands", "fa-linux", "black", "white"],
    devops: ["fa-solid", "fa-infinity", "blue", "white"],
    php: ["fa-brands", "fa-php", "purple", "white"],
    javascript: ["fa-brands", "fa-js", "yellow", "black"],
    docker: ["fa-brands", "fa-docker", "blue", "white"],
    kubernetes: ["none", "none", "blue", "white"],
  };

  for (let topic of topics) {
    const container = document.createElement("span"); //the items of the home page
    container.setAttribute('id', 'container');
    container.classList.add(topic.toLowerCase());
    container.setAttribute("data-attribute", topic);

    const i = document.createElement("i");
    i.classList.add(topicIcons[topic.toLowerCase()][0]);
    i.classList.add(topicIcons[topic.toLowerCase()][1]);
    i.style.color = topicIcons[topic.toLowerCase()][2];
    i.style.backgroundColor = topicIcons[topic.toLowerCase()][3];

    container.append(i);
    const span = document.createElement("span");
    span.innerText = topic;
    container.append(span);
    main.append(container);

    container.addEventListener("click", () => {
      fetchQuestions(container.getAttribute("data-attribute"));
    });
  }
};

//function to render question page

const renderQuestionPage = async (
  headingData,
  questionData,
  answers,
  correctAnswers,
  index
) => {
  main.innerHTML = "";
  const heading = document.createElement("div"); //heading of the question page
  heading.innerText = headingData;
  heading.setAttribute("id", "heading");
  main.append(heading);

  const question = document.createElement("div"); //heading of the question page
  question.innerText = index + 1 + ". " + questionData;
  question.setAttribute("id", "question");
  main.append(question);

  const options = document.createElement("div"); ///container for options of question
  options.setAttribute("id", "options");
  main.append(options);

  const optionContainer = {};

  for (let key in answers) {
    if (answers[key]) {
      const radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.setAttribute("name", "notMultipleAnswers");
      options.append(radioButton);
      radioButton.style.display = "none";

      const option = document.createElement("button"); ///container for options of question
      option.classList.add("option");
      options.append(option);

      const optionNummber = document.createElement("span"); //Container for option number
      optionNummber.innerText = key.substring(key.length - 1).toUpperCase();
      option.append(optionNummber);

      option.append(answers[key]);

      option.addEventListener("click", () => {
        radioButton.checked = true;
      });

      optionContainer[key] = [radioButton, option];
    }
  }

  const optionList = document.getElementsByClassName("option");

  const handleOptionClick = (e) => {
    for (let opt of Object.values(optionContainer)) {
      opt[1].classList.remove("selected");
    }
    e.target.classList.add("selected");
  };

  for (let element of optionList) {
    element.addEventListener("click", handleOptionClick);
  }

  const submit = document.createElement("button"); //Anwer submit button
  submit.setAttribute("id", "submit");
  submit.innerText = "SUBMIT";
  options.append(submit);
  const submitClicked = await new Promise((resolve, reject) => {
    submit.addEventListener("click", async () => {
      //promis to hault the execution of function until user answers the question.(i.e. clicks the submit button)
      let selected = false;
      for (let key in answers) {
        if (!answers[key]) continue;
        if (optionContainer[key][0].checked) selected = true;
      }
      if (!selected){
        options.classList.add('animateWhenNotSelectedAnswer');
        setTimeout(()=>options.classList.remove('animateWhenNotSelectedAnswer'), 500)
        
        return;
      } 
      let result = true;
      for (let key in answers) {
        if (!answers[key]) continue;
        if (correctAnswers[key + "_correct"] === "true") {
          optionContainer[key][1].classList.add("correct");
          optionContainer[key][1].classList.remove("selected");
        } else if (optionContainer[key][0].checked) {
          optionContainer[key][1].classList.add("wrong");
          optionContainer[key][1].classList.remove("selected");
          result = false;
        }
        optionContainer[key][1].removeEventListener("click", handleOptionClick);
      }
      submit.innerText = "NEXT\u2192";
      const gotoNextQuestion = await new Promise((resolve, reject) => {
        //haults the execution of function after user has clicked the submit button so that user can check the answer.
        //If his given answer is right or wrong. When user again clicks the button then promise gets resolved and the next question is loaded
        submit.addEventListener("click", () => {
          resolve(true);
        });
      });
      if (gotoNextQuestion) resolve(result);
    });
  });
  return submitClicked;
};

//Function that gives call to api and loads random questions. After loading questin it gives call to runTest funtion
//RunTest is function that handle the rendering of questions.
const fetchQuestions = async (category) => {
  const loadingScreen = renderLoadingPage();
  const key = "nfFsOsOYXyrDdo5iGhyKotSJ2GlEeAXkm3jjgg8p";
  const url = `https://quizapi.io/api/v1/questions?apiKey=${key}&tags=${category}&limit=10`;
  const unprocessed = await fetch(url);
  const res = await unprocessed.json();
  document.body.removeChild(loadingScreen);
  runTest(res, 0, 0, 0);
  return res;
};

//async function that renders the current question and waits for until user answers it before rendering the
//next question.
const runTest = async (data, ind, correct, total) => {
  if (ind == Object.keys(data).length) {
    showResults(correct, total);
    return;
  }
  let res = await renderQuestionPage(
    data[ind].tags[0].name,
    data[ind].question,
    data[ind].answers,
    data[ind].correct_answers,
    ind
  );
  if (res) runTest(data, ind + 1, correct + 1, total + 1);
  else runTest(data, ind + 1, correct, total + 1);
};

//

const showResults = (correct, total) => {
  main.innerHTML = "";
  const resultModul = document.createElement("div");
  resultModul.setAttribute("id", "resultModul");
  document.body.appendChild(resultModul);

  const resultContainer = document.createElement("div");
  resultContainer.setAttribute("id", "resultContainer");
  resultModul.appendChild(resultContainer);

  const trophyImageContainer = document.createElement("span");
  trophyImageContainer.setAttribute("id", "trophyImageContainer");
  resultContainer.appendChild(trophyImageContainer);

  const trophyImage = document.createElement("img");
  trophyImage.setAttribute("src", "trophy.png");
  trophyImageContainer.appendChild(trophyImage);

  const congrats = document.createElement("span");
  congrats.setAttribute("id", "congrats");
  congrats.innerText = "Congrats!";
  trophyImageContainer.appendChild(congrats);

  const score = document.createElement("span");
  score.setAttribute("id", "score");
  score.innerText = `${Math.round((correct / total) * 100)}% Score`;
  resultContainer.appendChild(score);

  const completion = document.createElement("span");
  completion.setAttribute("id", "completion");
  completion.innerText = "Quiz completed successfully.";
  resultContainer.appendChild(completion);

  const report = document.createElement("span");
  report.setAttribute("id", "report");
  report.innerHTML = `You answered <strong style="color:blue;">${total}</strong> questions out of which <strong style="color:rgb(22, 173, 5);">${correct}</strong> were correct`;
  resultContainer.appendChild(report);

  const close = document.createElement("span");

  close.innerHTML = '<i class="fa fa-close"></>';
  close.style.color = "white";
  close.style.position = "absolute";
  close.style.top = "1rem";
  close.style.right = "1rem";
  close.style.fontSize = "2rem";
  close.style.cursor = "pointer";
  resultModul.appendChild(close);
  close.addEventListener("click", () => {
    document.body.removeChild(resultModul);
    renderHomePage();
  });
};



const renderLoadingPage = ()=>{
  main.innerHTML = '';
  const loadingScreen = document.createElement('div');
  loadingScreen.setAttribute('id','loadingScreen');
  document.body.appendChild(loadingScreen);
  loadingScreen.append('Loading');
  const span1 = document.createElement('span');
  span1.innerText = '.'
  loadingScreen.appendChild(span1);

  const span2 = document.createElement('span');
  span2.innerText = '.'
  loadingScreen.appendChild(span2);

  const span3 = document.createElement('span');
  span3.innerText = '.'
  loadingScreen.appendChild(span3);

  return loadingScreen;
}

// renderLoadingPage();

renderHomePage();
