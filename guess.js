//setting name game 
let nameGame = "guess The Word";
document.title = nameGame;
document.querySelector("h1").innerHTML = nameGame;
document.querySelector("footer").innerHTML = `${nameGame} Game created by Mohamed Sabry`

// setting Game options
// mange words 

let words = ["Create", "Update", "Delete", "Master", "Branch", "Mainly", "Elzero", "School"];
function randomWord() {
    return words[Math.floor(Math.random() * words.length)].toLowerCase();
}
function addUpperCaseAndFoucinInput(input) {
    input.addEventListener("input", function () {
        this.value = this.value.toUpperCase();
        if (input.nextElementSibling) {
            input.nextElementSibling.focus();
        }
    })
}
function addarrwInput(input) {
    input.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
            if (input.nextElementSibling) {
                input.nextElementSibling.focus();
            }

        }

        if (event.key === "ArrowLeft") {
            if (input.previousElementSibling) {
                input.previousElementSibling.focus();
            }

        }
    })
}
function deleteLetterinInput(input) {
    input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace") {

            if (input.previousElementSibling) {
                input.value = ""
                input.previousElementSibling.value = ""
                input.previousElementSibling.focus();
            }

        }
    })
}
function genrateInput(context) {
    const numbersOfInputs = context.wordLength();
    const inputsContainer = document.querySelector(".inputs")
    //creat main tryDiv or parent div
    for (let i = 1; i <= context.totalTries; i++) {
        const tryDiv = document.createElement("div")
        tryDiv.classList.add(`try-${i}`, 'try')
        const span = document.createElement("span")
        span.innerHTML = `Try ${i}`
        tryDiv.append(span)



        //creat inputs
        for (let j = 1; j <= numbersOfInputs; j++) {
            const input = document.createElement("input")
            input.type = "text";
            input.id = `guess-${i}-input-${j}`
            input.setAttribute("maxLength", "1")
            tryDiv.appendChild(input)

            if (i !== 1) {
                tryDiv.classList.add("disabled-inputs") //!
                input.disabled = true


            }
            addUpperCaseAndFoucinInput(input)
            addarrwInput(input)
            deleteLetterinInput(input)
        }

        inputsContainer.appendChild(tryDiv)

    }
    inputsContainer.children[0].children[1].focus();
}

function guessCheck({context, canvas}) {
    const numbersOfInputs = context.wordLength();
    const wordGuess = context.currentWord();

    let successguess = true;
    for (let i = 1; i <= numbersOfInputs; i++) {
        const guess = canvas.guesser(context.currentTry(), i)

        const atctualLetter = wordGuess[i - 1]

        if (guess.isMatch(atctualLetter)) {
            //letter is correct and in place
            guess.markMatch();
            //letter is correct and not in place
        } else if (guess.isNotInPlace(wordGuess)) {
            guess.markNotInPlace();
            successguess = false;
            //if you miss write letter 
        } else if (guess.isMiss()) {
            guess.markMiss();
            successguess = false;
        }
        // letter is wrong
        else {
            guess.markWrong();
            successguess = false;
        }
    }
    //check if user win or lose
    if (successguess) {
        canvas.win(wordGuess)
    } else {
        // disabled curentTry 
        canvas.getTry(context.currentTry()).disable();

        context.nextTry();

        canvas.nextTry(context.currentTry());
    }
}

// mange hintButton 
function hint({context, canvas}) {
    // get enabled input from input 
    let enabledInput = document.querySelectorAll("input:not([disabled])")
    const wordGuess = context.currentWord();

    // get emptyInput

    // console.log(emptyInput)
    let emptyinput = Array.from(enabledInput).filter((input) => {
        return input.value === ""
    })

    // if user not input full emptyinput
    if (emptyinput.length > 0) {
        let randomIndex = Math.floor(Math.random() * emptyinput.length)//!! i cant use randoIndex with wordGuess to get random letter buecous randomIndex value change bettwen to var
        let randomInput = emptyinput[randomIndex]

        let indxRandomInputToFill = Array.from(enabledInput).indexOf(randomInput)
        // if randomInput in enabledInput  
        if (indxRandomInputToFill !== -1) {

            randomInput.value = wordGuess[indxRandomInputToFill].toUpperCase()
            randomInput.classList.add("hintInput")
        }
        // input try number of hint on span 
        if (context.hints > 0) {
            context.nextHint();
            document.querySelector(".hint span").innerHTML = context.hints
            if (context.hints === 0) {
                canvas.hintButton.disabled = true;

            }

        }

        randomInput.focus();
    }

}

function resetGame ({context, canvas}) {
    context.reset();
    canvas.reset(context);
    genrateInput(context);
}

const gameContext = {
    // Manage word
    word: randomWord(),
    currentWord() { return this.word },
    reset() { this.word = randomWord(); this.resetTry(); this.resetHint() },
    wordLength() { return this.word.length },

    // Manage tries
    totalTries: 6,
    tries: 1,
    currentTry() { return this.tries },
    nextTry() { this.tries++ },
    resetTry() { this.tries = 1 },

    // Manage hint
    hints: 2,
    nextHint() { this.hints-- },
    resetHint() { this.hints = 2 }
}

const gameCanvas = {
    // Controls
    massageArea: document.querySelector(".massage"),
    checkButton: document.querySelector(".check"),
    hintButton: document.querySelector(".hint"),
    hintCount: document.querySelector(".hint span"),
    resetButton: document.querySelector(".reset"),
    keyColors: document.querySelector(".key-colors"),
    inputsContainer: document.querySelector(".inputs"),
    tries: document.querySelectorAll(".try"),

    guesser(guess, letter){ 
        const guessElement = document.querySelector(`#guess-${guess}-input-${letter}`)
        return {
            value: guessElement.value.toLowerCase(),
            isMatch(actualLetter) { return this.value === actualLetter.toLowerCase() },
            markMatch() { guessElement.classList.add("yes-in-place") },
            isNotInPlace(word) { return this.value !== "" && word.includes(this.value) },
            markNotInPlace() { guessElement.classList.add("not-in-place") },
            isMiss() { return this.value === "" },
            markMiss() { guessElement.setAttribute("placeholder", "miss"); guessElement.style.backgroundColor = "red" },
            markWrong() { guessElement.classList.add("no") }
        }
    },

    getTry(tryNumber) {
        const tryElements = document.querySelector(`.try${tryNumber? `-${tryNumber}` : ""}`)
        return {
            isValidTry() { return Boolean(tryElements) },
            inputs: tryElements ? tryElements.querySelectorAll("input"): undefined,
            disable() {
                this.inputs.forEach((input) => input.disabled = true)
                tryElements.classList.add("disabled-inputs")
            },
            enable() {
                this.inputs.forEach((input) => input.disabled = false)
                tryElements.classList.remove("disabled-inputs")
                tryElements.children[1].focus()
            }
        }
    },
    nextTry(tryNumber) {
        const nextTry = this.getTry(tryNumber);
        if (nextTry.isValidTry()) {
            nextTry.enable();
        } else {
            this.gameOver();
        }
    },

    setHints(hints) {
        this.hintCount.innerHTML = hints;
    },
    resetMessage() {
        if (this.massageArea.hasChildNodes()) {
            while (this.massageArea.firstChild) {
                this.massageArea.removeChild(this.massageArea.firstChild)
            }
        }
    },
    resetInputs() {
        if (this.inputsContainer.hasChildNodes()) {
            while (this.inputsContainer.firstChild) {
                this.inputsContainer.removeChild(this.inputsContainer.firstChild)
            }
        }
    },
    disableTries() {
        this.tries.forEach((tryDiv) => {
            tryDiv.classList.add("disabled-inputs")
        })
    },

    hideKeyColors() {
        this.keyColors.style.display = "none";
    },
    showKeyColors() {
        this.keyColors.style.display = "block";
    },

    win(word) {
        let span = document.createElement("span")
        let text = document.createTextNode(word)
        let text2 = document.createTextNode("you win the word is")
        span.append(text)
        this.massageArea.append(text2, span)

        this.checkButton.disabled = true;
        this.hintButton.disabled = true;

        this.hideKeyColors();
        this.disableTries();
    },

    gameOver(word) {
        this.massageArea.classList.add("gameOver");
        const span = document.createElement("span");
        const text = document.createTextNode(word);
        span.appendChild(text)
        const text2 = document.createTextNode(`game over the word is`);
        this.massageArea.append(text2, span);

        this.checkButton.disabled = true;
        this.hintButton.disabled = true;

        this.keyColors.style.display = "none";
        
    },

    reset(context) {
        this.resetInputs();
        this.resetMessage();
        this.showKeyColors();

        this.checkButton.disabled = false;
        this.hintButton.disabled = false;
        this.setHints(context.hints);
    },

    setup(context) {
        this.checkButton.addEventListener("click", () =>  guessCheck({context, canvas: this}))
        this.hintButton.addEventListener("click", () => hint({context, canvas: this}))
        this.resetButton.addEventListener("click", () => resetGame({context, canvas: this}))
        this.setHints(context.hints);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                guessCheck({context, canvas: this})
            }
        })
    }
}

gameCanvas.setup(gameContext);

window.onload = genrateInput(gameContext);
