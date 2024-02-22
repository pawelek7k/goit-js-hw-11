import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const input = document.querySelector('.search-input');
const lightbox = new SimpleLightbox('.gallery a');

loader.style.display = 'none';

form.addEventListener('submit', async event => {
  event.preventDefault();
  const inputValue = input.value.trim();
  if (!inputValue) return;

  try {
    const data = await getImages(inputValue);

    if (!data.hits.length) {
      Notiflix.Notify.failure('No images found');
      return;
    }

    gallery.innerHTML = createMarkup(data.hits);
    lightbox.refresh();
    scrollToNextGroup();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Failed to fetch images');
  }
});

window.addEventListener('scroll', async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    const inputValue = input.value.trim();
    if (!inputValue) return;

    try {
      await loadMoreImages(inputValue);
    } catch (error) {
      console.log(error);
      Notiflix.Notify.failure('Failed to load more images');
    }
  }
});

async function getImages(name) {
  const key = '42475479-1764a7314469942521760576b';
  const searchParams = new URLSearchParams({
    key: key,
    q: name,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  const response = await fetch(`https://pixabay.com/api/?${searchParams}`);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

async function loadMoreImages(name) {
  loader.style.display = 'block';
  const data = await getImages(name);
  loader.style.display = 'none';

  if (!data.hits.length) {
    Notiflix.Notify.info('No more images to load');
    return;
  }

  gallery.innerHTML += createMarkup(data.hits);
  lightbox.refresh();
  scrollToNextGroup();
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <li class="gallery-item">
      <a class="gallery-link" href="${largeImageURL}">
        <img class="gallery-image" src="${webformatURL}" alt="${tags}" width="298" />
      </a>
      <div class="container-stats">
        <div class="block">
          <h2 class="title">Likes</h2>
          <p class="amount">${likes}</p>
        </div>
        <div class="block">
          <h2 class="title">Views</h2>
          <p class="amount">${views}</p>
        </div>
        <div class="block">
          <h2 class="title">Comments</h2>
          <p class="amount">${comments}</p>
        </div>
        <div class="block">
          <h2 class="title">Downloads</h2>
          <p class="amount">${downloads}</p>
        </div>
      </div>
    </li>`
    )
    .join('');
}

function scrollToNextGroup() {
  const cardHeight = document
    .querySelector('.gallery')
    .lastElementChild.getBoundingClientRect().height;
  window.scrollBy({ top: cardHeight, behavior: 'smooth' });
}
