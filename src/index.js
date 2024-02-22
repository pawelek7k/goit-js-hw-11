import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const input = document.querySelector('.search-input');
let page = 0;

loader.style.display = 'none';

form.addEventListener('submit', async event => {
  event.preventDefault();
  gallery.innerHTML = '';
  loader.style.display = 'block';

  const inputValue = input.value;

  try {
    const data = await getImages(inputValue);

    loader.style.display = 'none';

    if (!data.hits.length) {
      Notiflix.Notify.failure('This is not in our database');
    }

    gallery.innerHTML = createMarkup(data.hits);

    const refreshPage = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionDelay: 250,
    });
    refreshPage.refresh();

    scrollToNextGroup();
  } catch (error) {
    loader.style.display = 'none';
    console.log(error);
  }
});

async function getImages(name) {
  const key = '42475479-1764a7314469942521760576b';

  if (name.includes(' ')) {
    name = name.split(' ').join('+');
  }

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
      }) =>
        `<li class="gallery-item">
          <a class="gallery-link" href="${largeImageURL}">
            <img
              class="gallery-image"
              src="${webformatURL}"
              alt="${tags}"
              width="298"
            />
          </a>
          <div class="container-stats">
            <div class="block">
              <h2 class="tittle">Likes</h2>
              <p class="amount">${likes}</p>
            </div>
            <div class="block">
              <h2 class="tittle">Views</h2>
              <p class="amount">${views}</p>
            </div>
            <div class="block">
              <h2 class="tittle">Comments</h2>
              <p class="amount">${comments}</p>
            </div>
            <div class="block">
              <h2 class="tittle">Downloads</h2>
              <p class="amount">${downloads}</p>
            </div>
          </div>
        </li>`
    )
    .join('');
}

function scrollToNextGroup() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .lastElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

window.addEventListener('scroll', async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    const inputValue = input.value;
    await loadMoreImages(inputValue);
  }
});

async function loadMoreImages(name) {
  try {
    const data = await getImages(name);

    loader.style.display = 'none';

    if (!data.hits.length) {
      Notiflix.Notify.failure('No more images to load');
      return;
    }

    gallery.innerHTML += createMarkup(data.hits);

    scrollToNextGroup();
  } catch (error) {
    loader.style.display = 'none';
    console.log(error);
  }
}
