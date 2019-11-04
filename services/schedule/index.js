'use strict'

const scheduleJson = require('./schedule.json');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(isBetween);

const getAllGamesByDate = (scheduleJson) => {
  const allGamesArray = scheduleJson.lscd.reduce((acc, monthlySchedule) => {
    return acc.concat(monthlySchedule.mscd.g);
  }, []);
  const result = allGamesArray.reduce((acc, game) => {
    const gameDate = game.gdte;
    if (!acc[gameDate]) {
      acc[gameDate] = [];
    }
    acc[gameDate].push(game);
    return acc;
  }, {});
  return result;
};


// startOfWeekDate (Date)
const getGamesForWeek = (allGamesByDate, startOfWeekDate) => {
  // const gamesForMonth = getGamesForMonth(scheduleJson, startOfWeekDate);

  const startOfWeekDateDayJs = dayjs(startOfWeekDate);
  const endOfWeekDateDayJs = startOfWeekDateDayJs.add(1, 'week');

  // const gamesForWeek = gamesForMonth.filter(game => {
  const gamesForWeek = Object.keys(allGamesByDate).reduce((acc, key) => {
    const gameDateString = key // format: 2019-11-01
    const gameDateDayJs = dayjs(gameDateString);
    const isGameInWeek = gameDateDayJs.isBetween(startOfWeekDateDayJs, endOfWeekDateDayJs);
    if (isGameInWeek) {
      acc = acc.concat(allGamesByDate[key]);
    }
    return acc;
  }, []);

  return gamesForWeek;
}

const getTeams = game => {
  const result = [];
  result[0] = `${game.v.tc} ${game.v.tn}`;
  result[1] = `${game.h.tc} ${game.h.tn}`;
  return result;
}

const getNumGamesPerTeam = (gamesForWeek) => {
  const result = gamesForWeek
  .reduce((acc, game) => {
    const teams = getTeams(game);
    teams.forEach(team => {
      if (acc[team]) {
        acc[team]++;
      } else {
        acc[team] = 1;
      }
    })
    return acc;
  }, {})
  return result;
};

// returns the number of games per team given an input of start of week
// startOfWeek (string) e.g. 2019-11-15
const getData = (startOfWeekString) => {
  const startOfWeekDate = new Date(startOfWeekString);
  const allGamesByDate = getAllGamesByDate(scheduleJson);
  const gamesForWeek = getGamesForWeek(allGamesByDate, startOfWeekDate);
  const numGamesPerTeam = getNumGamesPerTeam(gamesForWeek);
  return numGamesPerTeam;
}

const data = getData('2019-11-30');
console.log('data is', data);

module.exports = async function (fastify, opts) {
  fastify.get('/schedule', async function (request, reply) {
    const date = request.query.d || '2019-11-30';
    const data = getData(date);
    return data;
  })
}
