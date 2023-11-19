import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getPicture } from './js/fetch-api';
import { refs } from './js/refs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const optionsLightbox = {
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  uniqueImages: true,
};
const lightbox = new SimpleLightbox('.gallery a', optionsLightbox);

let query = '';
let page = 1;
const per_page = 40;

// refs.load.classList.add('visually-hidden');

const paramsForNotify = {
  position: 'center-center',
  timeout: 2000,
  width: '500px',
  fontSize: '21px',
};

var optionsObserver = {
  root: null,
  rootMargin: '300px',
};

var observer = new IntersectionObserver(loadMore, optionsObserver);

refs.searchForm.addEventListener('submit', onClickSubmit);
// refs.load.addEventListener('click', onClickLoadMore);
// window.addEventListener('scroll', onScrollToTopBtn);

function onClickSubmit(evt) {
  evt.preventDefault();
  const { searchQuery } = evt.currentTarget.elements;
  query = searchQuery.value.trim().toLowerCase().split(' ').join('+');
  if (query) {
    clearGellery();
    page = 1;
    getPicture(query, page, per_page)
      .then(({ totalHits, hits }) => {
        if (totalHits === 0) {
          return queryError();
        }
        queryFound(totalHits);
        createMarkup(hits);
        lightbox.refresh();
        if (totalHits > per_page) {
          observer.observe(refs.jsGuard);
        }
      })
      .catch(err => console.log(err));
  }
  evt.currentTarget.reset();
}

function loadMore(entries, optionsObserver) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      getPicture(query, page, per_page)
        .then(({ totalHits, hits }) => {
          createMarkup(hits);
          lightbox.refresh();
          smoothScroll();
          if (page * per_page >= totalHits) {
            endOfSearch();
            observer.unobserve(refs.jsGuard);
          }
        })
        .catch(err => console.log(err));
    }
  });
}
// function onClickLoadMore() {
//   page += 1;
//   getPicture(query, page, per_page)
//     .then(data => {
//       console.log(data);
//       createMarkup(data.hits);
//       lightbox.refresh();
//       smoothScroll();
//       if (page * per_page >= data.totalHits) {
//         endOfSearch();
//         refs.load.classList.add('visually-hidden');
//       }
//     })
//     .catch(err => console.log(err));
// }

function createMarkup(arr) {
  const mas = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
      <a href="${webformatURL}">
        <img
          class="photo-card" src="${largeImageURL}" alt="${tags}" loading="lazy" width="300" height="200" />
      </a>
        <div class="info">
          <p class="info-item">
            ${likes}
            <b>Likes</b>
          </p>
          <p class="info-item">
            ${views}
            <b>Views</b>
        </p>
          <p class="info-item">
            ${comments}
            <b>Comments</b>
          </p>
          <p class="info-item">
            ${downloads}
            <b>Downloads</b>
          </p>
        </div>
      </div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', mas);
}

function queryFound(totalHits) {
  Notify.failure(`Hooray! We found ${totalHits} images.`, paramsForNotify);
}

function endOfSearch() {
  Notify.info(
    "We're sorry, but you've reached the end of search results.",
    paramsForNotify
  );
}

function queryError() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    paramsForNotify
  );
}

function clearGellery() {
  refs.gallery.innerHTML = '';
}

function smoothScroll() {
  const { height } = refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
