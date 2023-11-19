import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api';
const END_POINT = '';
const param = new URLSearchParams({
  key: '40677905-6b3bafbeacabf211fb6260d7f',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
});

export async function getPicture(q, page = 1, per_page) {
  const url = `${BASE_URL}/?q=${q}&page=${page}&per_page=${per_page}&${param}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.warn(`${error}`);
  }
}
