import { ImdbPipe } from './imdb.pipe';

describe('JoinPipe', () => {
  it('create an instance', () => {
    const pipe = new ImdbPipe();
    expect(pipe).toBeTruthy();
  });
});
