'use strict'

const scheduleJson = require('./schedule.json');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(isBetween);

// date (Date) e.g. 2019-11-15
const getMonth = (date) => {
  return dayjs(date).format('MMMM');
}

// scheduleJson (json)
// date (Date)
const getGamesForMonth = (scheduleJson, date) => {
  const month = getMonth(date);
  const result = scheduleJson.lscd.find(monthlyScheduleJson => {
    return monthlyScheduleJson.mscd.mon === month;
  })
  return result.mscd.g;
};

// startOfWeekDate (Date)
const getGamesForWeek = (startOfWeekDate) => {
  const gamesForMonth = getGamesForMonth(scheduleJson, startOfWeekDate);

  const startOfWeekDateDayJs = dayjs(startOfWeekDate);
  const endOfWeekDateDayJs = startOfWeekDateDayJs.add(1, 'week');

  const gamesForWeek = gamesForMonth.filter(game => {
    const gameDateString = game.gdte // format: 2019-11-01
    const gameDateDayJs = dayjs(gameDateString);
    const result = gameDateDayJs.isBetween(startOfWeekDateDayJs, endOfWeekDateDayJs);
    return result;
  })
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
  const gamesForWeek = getGamesForWeek(startOfWeekDate);
  const numGamesPerTeam = getNumGamesPerTeam(gamesForWeek);
  return numGamesPerTeam;
}

module.exports = async function (fastify, opts) {
  fastify.get('/schedule', async function (request, reply) {
    const date = request.query.d || '2019-11-30';
    const data = getData(date);
    return data;
  })
}
