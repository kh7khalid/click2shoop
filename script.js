let currentUser = '';

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if ((username === 'khalid7' && password === '2461') || (username === 'abed' && password === '2461')) {
        currentUser = username;
        document.getElementById('user').value = currentUser;
        document.getElementById('login').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
});

const links = document.querySelectorAll('nav ul li a');
links.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const contentId = this.getAttribute('href').substring(1);
        document.querySelectorAll('.content').forEach(content => content.style.display = 'none');
        document.getElementById(contentId).style.display = 'block';
        if (contentId === 'viewOrders') {
            displayOrders();
        }
        if (contentId === 'contacts') {
            displayContacts();
        }
        if (contentId === 'netSales') {
            displayNetSales();
        }
        if (contentId === 'netDelivery') {
            displayNetDelivery();
        }
    });
});

document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const orderName = document.getElementById('orderName').value;
    const deliveryPrice = document.getElementById('deliveryPrice').value;
    const packagePrice = document.getElementById('packagePrice').value;
    const customerName = document.getElementById('customerName').value;
    const region = document.getElementById('region').value;
    const village = document.getElementById('village').value;
    const phone = document.getElementById('phone').value;
    const user = currentUser;
    const date = new Date().toLocaleDateString();

    // Store the order details and calculate earnings
    const order = {
        orderName,
        deliveryPrice: parseFloat(deliveryPrice),
        packagePrice: parseFloat(packagePrice),
        customerName,
        region,
        village,
        phone,
        user,
        status: 'عند شركة التوصيل',
        date
    };

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Save customer details
    saveCustomerDetails(customerName, phone);

    alert('تم إضافة الطلب بنجاح');
    document.getElementById('orderForm').reset();
});

function saveCustomerDetails(name, phone) {
    const contact = { name, phone };
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function displayOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    orders.forEach((order, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = `order ${order.status === 'مغلق' ? 'closed' : ''}`;
        orderDiv.innerHTML = `
            <p>اسم الطلب: ${order.orderName}</p>
            <p>اسم العميل: ${order.customerName}</p>
            <p>رقم الهاتف: ${order.phone}</p>
            <p>المنطقة: ${order.region}</p>
            <p>القرية: ${order.village}</p>
            <p>سعر التوصيل: ${order.deliveryPrice} شيكل</p>
            <p>سعر الطرد: ${order.packagePrice} شيكل</p>
            <p>اسم المستخدم: ${order.user}</p>
            <p>تاريخ الإدخال: ${order.date}</p>
            <p>الحالة: <span style="color: ${order.status === 'مغلق' ? 'green' : 'red'};">${order.status}</span></p>
            ${order.status !== 'مغلق' ? `
            <button onclick="showPayerSelect(${index})">تم ارجاع الطلب</button>
            <button onclick="updateOrderStatus(${index}, 'مغلق', 'تم التوصيل')">تم التوصيل</button>
            <button onclick="updateOrderStatus(${index}, 'ملغى')">إلغاء الطلب</button>
            <select id="payerSelect${index}" style="display: none;">
                <option value="">اختر من يتحمل التكاليف</option>
                <option value="العميل">العميل</option>
                <option value="المستخدم">المستخدم</option>
            </select>
            <button id="confirmPayer${index}" onclick="confirmReturn(${index})" style="display: none;">تأكيد</button>` : ''}
        `;
        ordersList.appendChild(orderDiv);
    });
}

function showPayerSelect(index) {
    document.getElementById(`payerSelect${index}`).style.display = 'block';
    document.getElementById(`confirmPayer${index}`).style.display = 'block';
}

function confirmReturn(index) {
    const payerSelect = document.getElementById(`payerSelect${index}`);
    const payer = payerSelect.value;
    if (!payer) {
        alert('يرجى اختيار من يتحمل تكاليف الطرد.');
        return;
    }
    alert(`تم إرجاع الطلب، وسيتحمل تكاليف الطرد: ${payer}`);
    updateOrderStatus(index, 'مغلق', 'تم ارجاع الطلب');
}

function updateOrderStatus(index, status, reason = '') {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[index]) {
        orders[index].status = status;
        if (status === 'مغلق' && reason === 'تم التوصيل') {
            const netDelivery = orders[index].deliveryPrice;
            const netSales = orders[index].packagePrice;
            updateNetSales(netSales);
            updateNetDelivery(netDelivery);
        }
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders();
    }
}

function updateNetSales(netSales) {
    let totalNetSales = JSON.parse(localStorage.getItem('netSales')) || 0;
    totalNetSales += netSales;
    localStorage.setItem('netSales', JSON.stringify(totalNetSales));
}

function updateNetDelivery(netDelivery) {
    let totalNetDelivery = JSON.parse(localStorage.getItem('netDelivery')) || 0;
    totalNetDelivery += netDelivery;
    localStorage.setItem('netDelivery', JSON.stringify(totalNetDelivery));
}

function displayNetSales() {
    const netSales = JSON.parse(localStorage.getItem('netSales')) || 0;
    document.getElementById('netSalesResult').textContent = `صافي سعر البيع: ${netSales} شيكل`;
}

function displayNetDelivery() {
    const netDelivery = JSON.parse(localStorage.getItem('netDelivery')) || 0;
    document.getElementById('netDeliveryResult').textContent = `صافي سعر التوصيل: ${netDelivery} شيكل`;
}

document.getElementById('filter').addEventListener('change', function() {
    const filterValue = this.value;

    let earnings = 1000; // Placeholder for actual earnings calculation
    document.getElementById('earningsResult').textContent = `الأرباح خلال ${filterValue}: ${earnings} شيكل`;

    let regionStats = {
        'القدس': '0%',
        'الخليل': '0%',
        'نابلس': '0%',
        'رام الله والبيرة': '0%',
        'جنين': '0%',
        'طولكرم': '0%',
        'قلقيلية': '0%',
        'بيت لحم': '5%',
        'أريحا والأغوار': '0%',
        'طوباس': '0%',
        'سلفيت': '0%',
        'مناطق 48': '0%'
    };

    document.getElementById('regionStats').innerHTML = '';
    for (let region in regionStats) {
        const percentage = regionStats[region];
        const div = document.createElement('div');
        div.textContent = `${region}: ${percentage}`;
        document.getElementById('regionStats').appendChild(div);
    }
});

function displayContacts() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';

    contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact';
        contactDiv.innerHTML = `
            <span>${contact.name}: ${contact.phone}</span>
            <a href="https://wa.me/${contact.phone}" target="_blank">إرسال واتس</a>
        `;
        contactsList.appendChild(contactDiv);
    });
}
