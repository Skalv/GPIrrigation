'use strict'

const MQTTProv = use('GP/MQTT')
const Device = use('App/Models/Device')

class IrrigationManager {
  constructor() {
    MQTTProv.subscribe('GPIrrigation/helloGP', this.newRelay)
  }

  async newRelay (payload) {
    try {
      let msg = JSON.parse(payload)

      let device = await Device.findOrCreate(
        {macAddress: msg.macAddress},
        {
          macAddress: msg.macAddress,
          type: msg.type,
          uid: msg.uid
        }
      )

      if (device.uid !== msg.uid) {
        device.uid = msg.uid
        await device.save()
      }

      MQTTProv.publish(`GPIrrigation/${device.uid}`, JSON.stringify({
        action: "boardSynchro",
        state: "ok",
        uid: device.uid
      }))
    } catch (e) {
      console.error(e)
    }
  }

  getTriggers () {
    return []
  }

  getActions () {
    return [
      {
        name: "Start irrigation",
        fields: ["sensor_uid"]
      },
      {
        name: "Stop irrigation",
        fields: ["sensor_uid"]
      }
    ]
  }
}

module.exports = IrrigationManager