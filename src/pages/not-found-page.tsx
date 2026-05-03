import {Link} from 'react-router-dom';

const NOT_FOUND_DECOR_LAYER_SIZE = {
  width: 1366,
  height: 1959,
} as const;

const NotFoundPage = () => (
  <main className="page-content decorated-page not-found-page">
    <div className="decorated-page__decor" aria-hidden="true">
      <picture>
        <source
          type="image/webp"
          srcSet={`${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m.webp, ${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m@2x.webp 2x`}
        />
        <img
          src={`${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m.jpg`}
          srcSet={`${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m@2x.jpg 2x`}
          width={NOT_FOUND_DECOR_LAYER_SIZE.width}
          height={NOT_FOUND_DECOR_LAYER_SIZE.height}
          alt=""
        />
      </picture>
    </div>
    <div className="container container--size-l">
      <div className="page-content__title-wrapper">
        <h1 className="title title--size-l title--uppercase">404</h1>
        <p className="subtitle subtitle--size-l page-content__subtitle">Страница не найдена</p>
      </div>
      <p className="not-found-page__text">К сожалению, запрошенная страница не существует.</p>
      <Link className="btn btn--accent btn--cta" to="/">Перейти на главную</Link>
    </div>
  </main>
);

export default NotFoundPage;

