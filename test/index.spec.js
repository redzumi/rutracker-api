import chai               from 'chai';
import chaiAsPromised     from 'chai-as-promised';

const expect = chai.expect;

chai.use(chaiAsPromised);
chai.should();

import RutrackerAPI       from '../build/index.js';

const user = {
  login: process.env.login || 'test',
  password: process.env.password ||'test'
};

console.log('test user: ' + JSON.stringify(user));

describe('RutrackerAPI', () => {

  const rutracker = new RutrackerAPI();

  describe('login', () => {
    it('should return true', (done) => {
      rutracker.login(user.login, user.password)
        .then((loggedOn) => {
          expect(loggedOn).equal(true);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('search', () => {
    it('should return query error', (done) => {
      try {
        rutracker.search();
        done(new Error('Dint return query error.'));
      } catch(ex) {
        expect(ex.message).equal('Query string is required.');
        done();
      }
    });
    it('should return non empty results array', (done) => {
      rutracker.search('jazz').exec()
        .then((results) => {
          expect(results).to.have.length.above(0);
          done();
        })
        .catch((err) => {
          done(err);
        })
    });
  });

  describe('topic', () => {
    it('should return topic information', (done) => {
      rutracker.topic('5351337')
        .then((topic) => {
          expect(topic.created).to.not.include(null);
          done();
        })
        .catch((err) => {
          done(err);
        })
    });
  });

  describe('download', () => {
    it('should return true if .torrent file created', (done) => {
      rutracker.download('5351337', 'test/5351337.torrent')
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        })
    });
  });

});


