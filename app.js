'use strict'

const scheduleJson = require('./schedule.json');
const path = require('path')
const AutoLoad = require('fastify-autoload')
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
  console.log('game is', game);
  result[0] = `${game.v.tc} ${game.v.tn}`;
  result[1] = `${game.h.tc} ${game.h.tn}`;
  return result;
}

const getNumGamesPerTeam = (gamesForWeek) => {
  const result = gamesForWeek
  .reduce((acc, game) => {
    const teams = getTeams(game);
    console.log('teams are', teams);
    teams.forEach(team => {
      console.log('acc is', acc);
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

console.log(getData('2019-11-15'));


module.exports = function (fastify, opts, next) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  })

  // Make sure to call next when done
  next()
}
