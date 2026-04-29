import {Link} from 'react-router-dom';

const NotFoundPage = () => (
  <main className="page-content">
    <div className="container container--size-l">
      <div className="page-content__title-wrapper">
        <h1 className="title title--size-l title--uppercase">404</h1>
        <p className="subtitle page-content__subtitle">Страница не найдена</p>
      </div>
      <p>К сожалению, запрошенная страница не существует.</p>
      <Link className="btn btn--accent btn--general" to="/">Перейти на главную</Link>
    </div>
  </main>
);

export default NotFoundPage;

