import * as faceapi from '../../../src';
import { FaceLandmarks5 } from '../../../src/mtcnn/FaceLandmarks5';
import { describeWithNets, expectAllTensorsReleased, expectMaxDelta } from '../../utils';
import { expectMtcnnResults } from './expectedResults';

describe('allFacesMtcnn', () => {

  let imgEl: HTMLImageElement
  let facesFaceDescriptors: number[][]

  beforeAll(async () => {
    const img = await (await fetch('base/test/images/faces.jpg')).blob()
    imgEl = await faceapi.bufferToImage(img)
    facesFaceDescriptors = await (await fetch('base/test/data/facesFaceDescriptorsMtcnn.json')).json()
  })

  describeWithNets('computes full face descriptions', { withAllFacesMtcnn: true }, ({ allFacesMtcnn }) => {

    it('minFaceSize = 20', async () => {
      const forwardParams = {
        minFaceSize: 20
      }

      const results = await allFacesMtcnn(imgEl, forwardParams)
      expect(results.length).toEqual(6)

      const mtcnnResult = results.map(res => ({
        faceDetection: res.detection,
        faceLandmarks: res.landmarks as FaceLandmarks5
      }))
      expectMtcnnResults(mtcnnResult, 5, 5)
      results.forEach(({ descriptor }, i) => {
        descriptor.forEach((val, j) => expectMaxDelta(val, facesFaceDescriptors[i][j], 0.05))
      })
    })

  })

  describeWithNets('no memory leaks', { withAllFacesMtcnn: true }, ({ allFacesMtcnn }) => {

    it('single image element', async () => {
      await expectAllTensorsReleased(async () => {
        await allFacesMtcnn(imgEl)
      })
    })

  })


})