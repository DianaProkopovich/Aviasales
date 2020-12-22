// progress
const   formSearch = document.querySelector('.form-search'),  
        inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
        dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
        inputCitiesTo = formSearch.querySelector('.input__cities-to'),
        dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
        inputDateDepart = formSearch.querySelector('.input__date-depart'),
        cheapestTicket = document.getElementById('cheapest-ticket'),
        otherCheapTickets = document.getElementById('other-cheap-tickets');

//данные
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'http://alloworigin.com/',
    API_KEY = '864bec6fd0f32ee53bb4d8435d7f398d',
    calendar = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 7;
let city = [];
// Functions
const getData = (url, callback, reject = console.error) => {
        const request = new XMLHttpRequest(); // Объект и функция
        request.open('GET', url);
        request.addEventListener('readystatechange', () => {
            if (request.readyState !== 4) return;
    
            if (request.status === 200) {
                //вызов коллбэка
                callback(request.response);
            } else {
                reject(request.status);
            }
        });
        request.send();
};
//живой поиск
const showCity = (input, list) => {
    list.textContent ='';
    //filter возвращает массив
     // отсортировать массив городов через sort в алфавитном порядке
    if (input.value === '') return;
        const filterCity = city.filter((item) => {
            const fixItem = item.name.toLowerCase();
            return fixItem.startsWith(input.value.toLowerCase());
        });
        sortedCity = filterCity.sort();
        sortedCity.forEach((item) => {
            const cityLi = document.createElement('li');
            cityLi.classList.add('dropdown__city');
            cityLi.textContent = item.name;
            list.append(cityLi);
        });
}
// заполнение поля выбранным из списка
const fillCityField = (event, input, list) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
    }
    list.textContent = '';
}
// Парсинг приходящих данных
const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками' 
    } else {
        return 'Без пересадок'
    }
};
const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
}

// const getDate = (date) => {
//     const departDate = date.split('-').reverse().join('-');
//     return departDate;
// }
//https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
// Перевод в нужном часовом поясе
const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
const getLinkAviasales = (data) => {
    let link = "https://www.aviasales.ru/search/";
    link += data.origin;
    const date = new Date (data.depart_date);
    const day = date.getDate();
    link += day < 10 ? '0' + day : day;
    const month = date.getMonth() + 1;
    link += month < 10 ? '0' +  month : month;
    link += data.destination;
    link += '1';
    console.log(link);
    return link;
}
// SVX2905KGD1
const createCard = (data) => {
   const ticket = document.createElement('article');
   ticket.classList.add('ticket');
   let deep = '';
   if(data) {
       deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getLinkAviasales(data)}" target = "_blank" class="button button__buy">Купить
                    за ${data.value}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)} </div>
                </div>

                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
       `;
   } else {
       deep = '<h3> К сожалению, на данную дату билетов нет </h3>'
   }

   ticket.insertAdjacentHTML('afterbegin', deep)
   return ticket;
};
const renderCheapYear = (cheapTicketList) => {
    // отсортировать массив через sort по возрастанию дат
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    cheapTicketList.sort( (a, b) => a.value - b.value);
    for (let i = 0; i < cheapTicketList.length && i < MAX_COUNT; i++) {
        const ticket = createCard(cheapTicketList[i]);
        otherCheapTickets.append(ticket);
    }
}
// РЕНДЕР ЗАПИСИ О  САМОМ ДЕШЕВОМ БИЛЕТЕ
const renderCheapDate = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML= '<h2>Самый дешевый билет на выбранную дату</h2>';
    const ticket = createCard(cheapTicket[0]); // функция вернет конкретный билет
    cheapestTicket.append(ticket); 
}
// выбираем массив на нужную нам дату
const renderCheap = (data, date) => {
    otherCheapTickets.style.display = 'block';
    const cheapTicketList = JSON.parse(data).best_prices;
    const cheapTicketPerDate  = cheapTicketList.filter((item) => {
        return item.depart_date === date;
    })
    renderCheapDate(cheapTicketPerDate);//запись о самом дешевом билете
    renderCheapYear(cheapTicketList);//запись об остальных дешевых билетов
}

inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
});
inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
})
dropdownCitiesFrom.addEventListener('click', (event) =>{
    fillCityField(event, inputCitiesFrom, dropdownCitiesFrom)
})
dropdownCitiesTo.addEventListener('click', () => {
    fillCityField(event, inputCitiesTo, dropdownCitiesTo )
})   
formSearch.addEventListener('submit', (event) => {
    event.preventDefault(); // для отмены перезагрузки страницы
    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name);
    const formData = {
        from: cityFrom, // возвращает один первый найденный элемент
        to: city.find((item) => inputCitiesTo.value === item.name),
        when: inputDateDepart.value,
    };
    if (formData.from && formData.to) {
        const requestData = '?depart_date=' + formData.when +
        '&origin=' + formData.from.code + 
        '&destination=' + formData.to.code + 
        '&one_way=true' + 
        '&token=' + API_KEY; // формируем запрос url, token и proxy не обязательно
        //'?depart_date=2020-05-25&origin=SVX&destination=KGD&one_way=true&token=' + 
        const requestData_2 = `?depart_date=${formData.when}&origin=${formData.from}` + 
        `&destination=${formData.to}&one_way=true`
        //выполнится, если есть соответствующие билеты
        getData(calendar + requestData, 
            (response) => {
                renderCheap(response, formData.when);
            }, 
            (error) => {
                alert('В этом направлении нет рейсов');
                console.error('Ошибка', error);
                
            });
    } else {
        alert('Введите корректное название города');
    }
});     
//ПОЛУЧАЕМ И СОРТИРУЕМ СПИСОК ГОРОДОВ
getData(proxy + citiesApi, (data) =>{
    city = JSON.parse(data).filter(item => item.name && item.destination && item.origin // у которых есть name
    );
// сортировка сразу после получения по алфавиту
    city.sort( (a, b) => {
    if (a.name > b.name) {
        return 1;
        }
    if (a.name < b.name) {
    return -1;
    }
    return 0;
})
});
// city = JSON.parse(data).filter((item) => {
//    return item.name; // у которых есть name

// getData(proxy + calendar + 
//     '?depart_date=2020-05-25&origin=SVX&destination=KGD&one_way=true&token=' + 
//     API_KEY, (data) => {
//         const cheapTicket = JSON.parse(data).best_prices.filter(item => item.depart_date === '2020-05-25')
//         console.log(cheapTicket);
//     }
// )
// Array.filter(console.log);

// formSearch.addEventListener('submit', ({target}) => {
//     target...
// })     
//REST API - ONLINE API
//request.readyState - статусы open -1, send -2, передает параметры, 3- ожидает ответ
// 4 - пришел ответ
// алгоритмы bbc
// всплывашка "укажите правильный город", "В этом направлении нет рейсов", исчезновение списка - событие на боди или блюр с инпута