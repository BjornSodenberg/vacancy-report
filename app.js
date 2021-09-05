"use strict";
// 1. топ вакансий по рубрикам; (done)
// 2. топ слов по упоминанию их в заголовках вакансий. (done)
// сообщение что не удалось получить данные

const API_URL = 'http://api.zp.ru/v1/';

const API_ENDPOINTS = {
  VACANCIES: 'vacancies',
  RUBRICS: 'rubrics',
  GEO: 'geo?fields[]=name&fields[]=id',
};

(async function () {
  const root = document.querySelector('#root');

  const query = {
    city_id: '',
    period: 'today',
    is_new_only: 'true'
  }

  const geoID = await getGeoIdByCityName('Новосибирск');
  if(geoID === -1) alert('Ошибка при  загрузке города');
  else query.city_id = geoID;

  const vacancies = await getVacancies(query);
  if(!vacancies) alert('Ошибка при загрузке списка вакансий');

  const rubrics = await getRubrics();
  if(rubrics === -1) alert('Ошибка при загрузке списка рубрик');

  const listOfWords = getTopInWords(vacancies);
  const listOfRubrics = getTopByRubrics(vacancies,rubrics);

  const wordsSorted = sortArray(listOfWords)
  const rubricsSorted = sortArray(listOfRubrics)

  viewTopWords(wordsSorted, root);
  viewTopRubrics(rubricsSorted, root)

})()

function viewTopWords (data, context) {
  let top = '';
  data.forEach(el => {
    top += `
    <tr>
        <td>${el[0]}</td>
        <td>${el[1]}</td>
    </tr>`
  })
  context.innerHTML += `
  <table id="words" class="table">
    <thead>
      <th>Слово</th>
      <th>Количество</th>
    </thead>
    <tbody>
        ${top}
    </tbody>
  </table>`
}

function viewTopRubrics (data, context) {
  let top = '';
  data.forEach(el => {
    top += `
    <tr>
        <td>${el[0]}</td>
        <td>${el[1]}</td>
    </tr>`
  })
  context.innerHTML += `
  <table id="rubrics" class="table">
    <thead>
      <th>Рубрика</th>
      <th>Количество</th>
    </thead>
    <tbody>
        ${top}
    </tbody>
  </table>`
}

function getTopByRubrics (vacancies, rubrics) {
  let rubricsList = [];
  vacancies.forEach(el => {
    el.rubrics.forEach(rubric => {
      const {title} = rubric;
      if((rubricsList[title])) {
        return  rubricsList[title] += 1;
      }
      return rubricsList[title] = 1
    })
  })
  rubrics.forEach(el => {
    if(!rubricsList[el.title]){
      rubricsList[el.title] = 0;
    }
  })
  return rubricsList;
}

function getTopInWords (vacancies){
  let listOfWords = [];
  try {
    vacancies.forEach( vacancy => {
      const {header} = vacancy;
      const words = header && header.split(/[ ,.()-\/]/);
      words.forEach(word => {
        if(!word) return null;
        if(listOfWords[word]){
          return listOfWords[word] += 1;
        }
        return listOfWords[word] = 1;
      })
    })
  } catch (e) {
    throw new Error(e)
  }
  return listOfWords;
}

async function getRubrics () {
  try {
    const rubricsData = await fetchFromApi(API_ENDPOINTS.RUBRICS);
    return rubricsData.rubrics;
  } catch (e) {
    return false
  }
}

async function getGeoIdByCityName (city) {
  try {
    const geoData = await fetchFromApi(API_ENDPOINTS.GEO);
    const geoID = geoData.geo.find(({name}) => name === city);
    return geoID.id;
  } catch (e) {
    return false;
  }
}

async function getVacancies (queryProps) {
  let query = '/?';
  for (const [key, value] of Object.entries(queryProps)){
    if(value)
      query+= `${key}=${value}&`
  }
  try {
    const vacanciesData = await fetchFromApi(API_ENDPOINTS.VACANCIES,query);
    return vacanciesData.vacancies;
  } catch (e) {
    return false
  }
}

async function fetchFromApi (path = '', query ='') {
  try {
    let url = API_URL+path+query;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

function sortArray (entries) {
  return Object.entries(entries).sort((a,b)  => b[1] - a[1])
}





