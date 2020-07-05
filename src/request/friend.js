
const { SessionModel } = require('../model/session')
const { FriendRequestsModel } = require('../model/friendRequests')
const { UserModel } = require('../model/user')
const { sendRequest } = require('../connection/payload')
const { logger } = require('../logger')

/**
 * Send friend requests to client
 * @param {Socket} client Client socket
 */
function sendFriendRequests (client) {
  /* Get user session */
  SessionModel.getByIpPort(client.remoteAddress, client.remotePort)
    .then(session => {
      if (session === null) return
      /* Find friends requests to current user */
      FriendRequestsModel.find({ toUserId: session.userId })
        .then(async friendRequests => {
          const requests = []
          /* Get user infomation in friend requests */
          for (const index in friendRequests) {
            await UserModel.findOne({ _id: friendRequests[index].fromUserId })
              .then(user => {
                requests.push({
                  _id: friendRequests[index]._id,
                  fromUserId: friendRequests[index].fromUserId,
                  fromUsername: user.username
                })
              })
          }
          sendRequest({
            action: 'sendFriendRequests',
            data: { friendRequests: requests }
          }, client)
        })
    })
    .catch(err => {
      logger.error(err)
    })
}

module.exports = {
  sendFriendRequests
}
