tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                ghostink: ['GHOSTINK', 'cursive'],
            },
            colors: {
                pastel: {
                    1: '#01002E',
                    2: '#2F72BA',
                    3: '#3D9FDD',
                    4: '#EFB2EF',
                    5: '#D5BAC7',
                    6: '#DD74CF',
                    7: '#DD53B4',
                },
                rtg: {
                    1: '#16532e',
                    2: '#04b989',
                    3: '#22c55e',
                    4: '#facc15',
                    5: '#fc8a4a',
                    6: '#f87171',
                },
            },
        },
    },
};

let priority = 1;

document.addEventListener('DOMContentLoaded', async () => {
    let userData = await getUserData().catch((error) => {
        console.error(error);
        Swal.fire('Error', 'An error occurred', 'error');
    });
    if (userData.admin) {
        //window.location.replace("/admin");
        document.getElementById('adminButton').classList.remove('hidden');
    }
    console.log(userData);

    let priorityNumberElement = document.getElementById('priorityNumber');
    let selectableTemplate = document.getElementById('selectableTemplate');
    let ingredientsContainer = document.getElementById('ingredientsWrapper');
    let optionsContainer = document.getElementById('optionsWrapper');
    let priorityInput = document.getElementById('priorityInput');
    let priorityValue = document.getElementById('priorityValue');

    function changePriority(newPriority) {
        //set priorityInput value and max to priority
        priorityInput.value = newPriority;
        priorityInput.max = newPriority;

        //set priorityValue text to priority
        priorityValue.textContent = newPriority;
        newPriority = Number(newPriority);
        priorityNumberElement.classList.remove('bg-rtg-' + priority);
        priorityNumberElement.classList.add('bg-rtg-' + newPriority);
        if (newPriority > 3 && priority < 4) {
            priorityNumberElement.classList.remove('text-white');
            priorityNumberElement.classList.add('text-black');
        }
        if (newPriority < 4 && priority > 3) {
            priorityNumberElement.classList.remove('text-black');
            priorityNumberElement.classList.add('text-white');
        }
        priorityNumberElement.textContent = newPriority;
        priority = newPriority;
    }

    if (userData.priority) {
        changePriority(userData.priority);
    }

    pb.collection('users').subscribe(
        userData.id,
        function (e) {
            if (priority != e.record.priority)
                changePriority(e.record.priority);
        },
        {}
    );

    let toRadians = (deg) => (deg * Math.PI) / 180;
    let map = (val, a1, a2, b1, b2) =>
        b1 + ((val - a1) * (b2 - b1)) / (a2 - a1);

    class Pizza {
        constructor(id) {
            this.canvas = document.getElementById(id);
            this.ctx = this.canvas.getContext('2d');

            this.sliceCount = 8;
            this.sliceSize = 80;

            this.width =
                this.height =
                this.canvas.height =
                this.canvas.width =
                    this.sliceSize * 2 + 50;
            this.center = (this.height / 2) | 0;

            this.sliceDegree = 360 / this.sliceCount;
            this.sliceRadians = toRadians(this.sliceDegree);
            this.progress = 0;
            this.cooldown = 10;
        }

        update() {
            let ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            if (--this.cooldown < 0)
                this.progress +=
                    this.sliceRadians * 0.01 + this.progress * 0.07;

            ctx.save();
            ctx.translate(this.center, this.center);

            for (let i = this.sliceCount - 1; i > 0; i--) {
                let rad;
                if (i === this.sliceCount - 1) {
                    let ii = this.sliceCount - 1;

                    rad = this.sliceRadians * i + this.progress;

                    ctx.strokeStyle = '#FBC02D';
                    cheese(ctx, rad, 0.9, ii, this.sliceSize, this.sliceDegree);
                    cheese(ctx, rad, 0.6, ii, this.sliceSize, this.sliceDegree);
                    cheese(ctx, rad, 0.5, ii, this.sliceSize, this.sliceDegree);
                    cheese(ctx, rad, 0.3, ii, this.sliceSize, this.sliceDegree);
                } else rad = this.sliceRadians * i;

                // border
                ctx.beginPath();
                ctx.lineCap = 'butt';
                ctx.lineWidth = 11;
                ctx.arc(0, 0, this.sliceSize, rad, rad + this.sliceRadians);
                ctx.strokeStyle = '#F57F17';
                ctx.stroke();

                // slice
                let startX = this.sliceSize * Math.cos(rad);
                let startY = this.sliceSize * Math.sin(rad);
                let endX = this.sliceSize * Math.cos(rad + this.sliceRadians);
                let endY = this.sliceSize * Math.sin(rad + this.sliceRadians);
                let varriation = [0.9, 0.7, 1.1, 1.2];
                ctx.fillStyle = '#FBC02D';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(startX, startY);
                ctx.arc(0, 0, this.sliceSize, rad, rad + this.sliceRadians);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
                ctx.lineWidth = 0.3;
                ctx.stroke();

                // meat
                let x =
                    this.sliceSize *
                    0.65 *
                    Math.cos(rad + this.sliceRadians / 2);
                let y =
                    this.sliceSize *
                    0.65 *
                    Math.sin(rad + this.sliceRadians / 2);
                ctx.beginPath();
                ctx.arc(x, y, this.sliceDegree / 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#D84315';
                ctx.fill();
            }

            ctx.restore();

            if (this.progress > this.sliceRadians) {
                ctx.translate(this.center, this.center);
                ctx.rotate((-this.sliceDegree * Math.PI) / 180);
                ctx.translate(-this.center, -this.center);

                this.progress = 0;
                this.cooldown = 20;
            }
        }
    }

    function cheese(ctx, rad, multi, ii, sliceSize, sliceDegree) {
        let x1 =
            sliceSize * multi * Math.cos(toRadians(ii * sliceDegree) - 0.2);
        let y1 =
            sliceSize * multi * Math.sin(toRadians(ii * sliceDegree) - 0.2);
        let x2 = sliceSize * multi * Math.cos(rad + 0.2);
        let y2 = sliceSize * multi * Math.sin(rad + 0.2);

        let csx = sliceSize * Math.cos(rad);
        let csy = sliceSize * Math.sin(rad);

        var d = Math.sqrt((x1 - csx) * (x1 - csx) + (y1 - csy) * (y1 - csy));
        ctx.beginPath();
        ctx.lineCap = 'round';

        let percentage = map(d, 15, 70, 1.2, 0.2);

        let tx = x1 + (x2 - x1) * percentage;
        let ty = y1 + (y2 - y1) * percentage;
        ctx.moveTo(x1, y1);
        ctx.lineTo(tx, ty);

        tx = x2 + (x1 - x2) * percentage;
        ty = y2 + (y1 - y2) * percentage;
        ctx.moveTo(x2, y2);
        ctx.lineTo(tx, ty);

        ctx.lineWidth = map(d, 0, 100, 20, 2);
        ctx.stroke();
    }

    let pizza = new Pizza('pizza');

    (function update() {
        requestAnimationFrame(update);
        pizza.update();
    })();

    function loadSelectable(selectables, option = false) {
        selectables.forEach((selectable) => {
            let selectableElement =
                selectableTemplate.content.cloneNode(true).children[0];
            selectableElement.innerHTML = selectable;
            if (option) {
                optionsContainer.appendChild(selectableElement);
                return;
            }
            ingredientsContainer.appendChild(selectableElement);
        });
    }

    fetch('/api/session/get')
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            loadSelectable(data.ingredients);
            loadSelectable(data.options, 1);
        })
        .catch((err) => {
            console.log('No current session');
            document.getElementById('orderPage').classList.add('hidden');
            document.getElementById('noSessionPage').classList.remove('hidden');
        });
    document.getElementById('nameInput').value = userData.name;
});

function autoGrow(element) {
    element.style.height = '5px';
    element.style.height = element.scrollHeight + 'px';
}

function fadeOutSection(section, callback = () => {}) {
    for (let i = 0; i < section.childElementCount - 1; i++) {
        section.children[i].classList.add(
            'transition-all',
            'duration-300',
            'opacity-0',
            'scale-x-105'
        );
    }
    setTimeout(() => {
        section.classList.add('hidden');
        callback();
    }, 300);
}

function orderPizza() {
    let ingredientsContainer = document.getElementById('ingredientsWrapper');
    let optionsContainer = document.getElementById('optionsWrapper');

    let ingredients = [],
        options = [];
    for (let i = 0; i < ingredientsContainer.childElementCount; i++) {
        if (
            ingredientsContainer.children[i].classList.contains('bg-rtg-3/[.5]')
        ) {
            ingredients.push(ingredientsContainer.children[i].textContent);
        }
    }
    console.log(ingredients);
    console.dir(optionsContainer);
    for (let i = 0; i < optionsContainer.childElementCount; i++) {
        if (optionsContainer.children[i].classList.contains('bg-rtg-3/[.5]')) {
            options.push(optionsContainer.children[i].textContent);
        }
    }
    console.log(options);

    priority = Number(document.getElementById('priorityInput').value);
    fetch('/api/orders/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: document.getElementById('nameInput').value,
            comment: document.getElementById('commentInput').value,
            ingredients,
            options,
            priority,
        }),
    })
        .then((res) => res.json())
        .then((data) => console.log(data));
}
