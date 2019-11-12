module.exports = {
    trivialPackages: [
        {
          '$match': {
            '$and': [
              {
                'numOfLines': {
                  '$ne': null
                }
              }, {
                'escomplex.cyclomatic': {
                  '$ne': null
                }
              }
            ]
          }
        }, {
          '$project': {
            'package': 1, 
            'simplePackage': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$lt': [
                        '$numOfLines', 35
                      ]
                    }, {
                      '$lt': [
                        '$escomplex.cyclomatic', 10
                      ]
                    }
                  ]
                }, 1, 0
              ]
            }
          }
        }, {
          '$group': {
            '_id': '$package', 
            'countSimple': {
              '$sum': '$simplePackage'
            }
          }
        }
      ]
}