// WebSocket setup
let url = `ws://${window.location.host}/ws/socket-server/`;
const chatSocket = new WebSocket(url);

chatSocket.onmessage = function (e) {
    let data = JSON.parse(e.data);
    console.log('Data:', data);

    if (data.type === 'chat') {
        let messageContainer = document.getElementById('orders');
        if (messageContainer.children.length < 9) {
            let messageElement = document.createElement('div');
            messageElement.innerHTML = `${data.message} <br> (テーブル: ${data.table_number})`;

            messageElement.addEventListener('click', function () {
                messageContainer.removeChild(messageElement);
            });

            messageContainer.appendChild(messageElement);
        }
    }
};

// キーボードからテーブル番号を入力
function enterNumber(number) {
    const tableNumberInput = document.getElementById('table-number');
    tableNumberInput.value += number;
}

// テーブル番号をリセット
function clearNumber() {
    const tableNumberInput = document.getElementById('table-number');
    tableNumberInput.value = '';
}

// 選んだ注文のリセット
let selectedItems = [];

// 注文のロジック
document.querySelectorAll('.send-btn').forEach(button => {
    button.addEventListener('click', function () {
        const itemName = this.getAttribute('data-message');

        const existingItem = selectedItems.find(item => item.name === itemName);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            selectedItems.push({ name: itemName, quantity: 1 });
        }
        updateSelectedItemsList();
    });
});

// 注文の内容を更新
function updateSelectedItemsList() {
    const list = document.getElementById('selected-items-list');
    list.innerHTML = '';

    selectedItems.forEach((item, index) => {
        const li = document.createElement('li');

        li.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <div class="selected-items-list-container">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <p class="item-quantity">${item.quantity}</p>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                        <button onclick="removeItem(${index})">消</button>
                    </div>
                `;

        list.appendChild(li);
    });
}

// 注文の量を調整する
function changeQuantity(index, delta) {
    selectedItems[index].quantity += delta;

    if (selectedItems[index].quantity <= 0) {
        selectedItems.splice(index, 1);
    }
    updateSelectedItemsList();
}
// 注文を削除する
function removeItem(index) {
    selectedItems.splice(index, 1);
    updateSelectedItemsList();
}

//注文ボタンを押したら、情報を送ります。
function sendOrder() {
    const tableNumberInput = document.getElementById('table-number');
    const tableNumber = tableNumberInput.value.trim();

    if (!tableNumber) {
        alert("テーブル番号を入力してください。");
        return;
    }

    const orderMessage = selectedItems.map(item => `${item.name} x${item.quantity}`).join('<br>');

    chatSocket.send(JSON.stringify({
        'message': orderMessage,
        'table_number': tableNumber
    }));

    selectedItems = [];
    updateSelectedItemsList();

    tableNumberInput.value = '';
}

window.onload = function () {
    if (window.innerWidth <= 768) {
        showMenu();
    } else {
        showOrders();
    }
}

function showMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('orders').style.display = 'none';
}

function showOrders() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('selected-items').style.display = 'none';
    document.getElementById('orders').style.display = 'grid';
}


function showSection(sectionId) {
    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

showSection('tentodon');
