// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher("13fcdedc78efac0503d7", {
  cluster: "eu",
});

var channel = pusher.subscribe("orders");
channel.bind("new-order", function (data) {
  console.log(JSON.stringify(data));
});

let currentSession = 0;

//post new order to /api/orders/new
// {
//     name: "test",
//     ingredients: ["cheese", "salami"]
//     options: ["extra cheese", "calzone"]
// }

/*
<button id="getSession">Get Current Session</button>
            <button id="getIngredients">Get Ingredients</button>
            <button id="getOptions">Get Options</button>
            <button id="getTestPizza">Request Test Pizza</button>
*/

function fetchAndLog(toFetch) {
  fetch(toFetch)
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("getSession").addEventListener("click", () => {
    fetch("/api/get/session")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        currentSession = data;
      })
      .catch((err) => console.error(err));
  });

  document.getElementById("getIngredients").addEventListener("click", () => {
    fetchAndLog("/api/get/ingredients");
  });

  document.getElementById("getOptions").addEventListener("click", () => {
    fetchAndLog("/api/get/options");
  });

  document.getElementById("getOrders").addEventListener("click", () => {
    fetchAndLog("/api/get/orders");
  });

  document.getElementById("getTestPizza").addEventListener("click", () => {
    fetch("/api/orders/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "test",
        ingredients: ["cheese", "salami"],
        options: ["extra cheese", "calzone"],
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  });
});
