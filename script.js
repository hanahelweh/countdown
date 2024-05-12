//if there's an object in the local storage get it, else create a new empty object
let countdownObj = JSON.parse(localStorage.getItem('countdowns')) || {};

//variable to create a new key according to the previous one to avoid override of objects
let countNbs = Object.keys(countdownObj).length + 1 || 1;

//random index to get random color
let i;
const colors = ['#CDA7F4', '#f6ca94', '#c1ebc0', '#c7caff', '#cdabeb', '#f09ea7'];

//html elements
const ourForm = document.querySelector('.NewTask');
const events = document.querySelector('.events');
const openModalBtn = document.querySelector('.new-countdown-btn');
const modal = document.querySelector('.modal');
const titleInput = document.getElementById("titleInput");
const datePicker=document.getElementById("datePicker");
const timePicker=document.getElementById("timePicker");
const emptyContainer = document.querySelector('.empty-container');

//create a minimumDate to attach it to the date input so i can't select from previous days
const minimumDate = new Date().toISOString().split('T')[0];
datePicker.setAttribute('min',minimumDate);

//on form submit
ourForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value;
    const date = datePicker.value + "T" + timePicker.value;

    i = Math.floor(Math.random() * colors.length);

    //create a new countdown object from inputs values
    countdownObj[countNbs] = {
        Title: title,
        Date: date,
        Color: colors[i],
        finished: false
    };

    //add the created countdown object to the countdownObj object saved in the local storage 
    localStorage.setItem("countdowns", JSON.stringify(countdownObj));
    countNbs++;//increment the key of the object by 1 to ensure that the next object will have a unique key

    modal.classList.remove("show");

    //reset inputs
    ourForm.reset();

    //reload the page to get updates on the local storage
    location.reload();
});

//function to check if there's a countdown in the local storage to show/hide the emptyContainer
function EmptyState(){
    if(Object.keys(countdownObj).length){
        emptyContainer.classList.add('hide');
        openModalBtn.classList.remove('hide');
    }else{
        emptyContainer.classList.remove('hide')
        openModalBtn.classList.add('hide');
    }
}

//function to count the gap between today and the date chosen to make the count
function Count(countDate) {
    const today = new Date().toISOString();
    const todayTime = Date.parse(today);
    const countDateTime = Date.parse(countDate);
    let timeToBeCounted = (countDateTime - todayTime) / 1000;
    let days = Math.floor(timeToBeCounted / 86400);
    let remaining1 = timeToBeCounted % 86400;
    let hours = Math.floor(remaining1 / 3600);
    let remaining2 = remaining1 % 3600;
    let minutes = Math.floor(remaining2 / 60);
    let seconds = Math.floor(remaining2 % 60);
    return [days, hours, minutes, seconds, timeToBeCounted];
}

for (let key in countdownObj) {
    if (countdownObj.hasOwnProperty(key)) {
        let storedCount = countdownObj[key];
        let [days, hours, minutes, seconds, timeToBeCounted] = Count(storedCount.Date);
        //display countdown objects
        if (!storedCount.finished) {
            events.insertAdjacentHTML('beforeend', `
                <div class="event-container key${key}">
                    <div class="event key${key}" style="background-color:${storedCount.Color}30;">
                        <div onclick="DeleteFinished(${key})" class="delete-event-btn">
                            <i class="fa-solid fa-close"></i>
                        </div>
                        <div class="event-header">
                            <div class="event-icon" style="background-color:${storedCount.Color};">
                                <i class="fa-regular fa-clock"></i>
                            </div>
                            <div class="event-name">${storedCount.Title}</div>
                            <div class="counter-date">${storedCount.Date.split('T')[0] + " - " + storedCount.Date.split('T')[1]}</div>
                        </div>
                        <div class="counter-info" style="background-color:${storedCount.Color};">
                            <div class="counter">
                                <div class="number days">${days}</div>
                                <div class="number-title">Days</div>
                            </div>
                            <div class="counter">
                                <div class="number hours">${hours}</div>
                                <div class="number-title">Hours</div>
                            </div>
                            <div class="counter">
                                <div class="number minutes">${minutes}</div>
                                <div class="number-title">Minutes</div>
                            </div>
                            <div class="counter">
                                <div class="number seconds">${seconds}</div>
                                <div class="number-title">Seconds</div>
                            </div>
                        </div>
                    </div>
            </div>`);

            //each second update the remaining time
            let interval = setInterval(() => {
                let [days, hours, minutes, seconds, timeToBeCounted] = Count(storedCount.Date);
                if (timeToBeCounted > 0) {
                    document.querySelector(`.event-container.key${key}`).querySelector('.days').textContent = days;
                    document.querySelector(`.event-container.key${key}`).querySelector('.hours').textContent = hours;
                    document.querySelector(`.event-container.key${key}`).querySelector('.minutes').textContent = minutes;
                    document.querySelector(`.event-container.key${key}`).querySelector('.seconds').textContent = seconds;
                } else {
                    clearInterval(interval);
                    countdownObj[key].finished = true;
                    localStorage.setItem("countdowns", JSON.stringify(countdownObj));
                    //if the countdown finished immedtiately change the content on the finished countdown and display a message that is finished
                    document.querySelector(`.event-container.key${key}`).innerHTML = `
                    <div class="event key${key}" style="background-color:${storedCount.Color}30;">
                    <div onclick="DeleteFinished(${key})" class="delete-event-btn">
                        <i class="fa-solid fa-close"></i>
                    </div>
                    <div><i class="fa-solid fa-file-signature"></i> Count for ${storedCount.Title} Finished on ${storedCount.Date.split('T')[0] + " - " + storedCount.Date.split('T')[1]}</div>
                </div>
                    `;
                }
            }, 1000);
        } else if (storedCount.finished) {
            //append countdown to the html based on the finished status saved in the localStorage to be saved on refresh
            events.insertAdjacentHTML('beforeend',`
            <div class="event-container key${key}">
                <div class="event key${key}" style="background-color:${storedCount.Color}30;">
                    <div onclick="DeleteFinished(${key})" class="delete-event-btn">
                        <i class="fa-solid fa-close"></i>
                    </div>
                    <div><i class="fa-solid fa-file-signature"></i> Count for ${storedCount.Title} Finished on ${storedCount.Date.split('T')[0] + " - " + storedCount.Date.split('T')[1]}</div>
                </div>
            </div>
        `);
        }
    }
}


 
function OpenModal(){
    modal.classList.add("show");
}

function CloseModal(){
    modal.classList.remove("show");
}

//delete countdown (finished or not) when i click on the x button for each one 
function DeleteFinished(key){
    delete countdownObj[key];
    localStorage.setItem('countdowns', JSON.stringify(countdownObj));
    location.reload();
}

EmptyState();