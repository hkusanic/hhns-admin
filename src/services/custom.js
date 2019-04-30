/* eslint-disable no-plusplus */
import $ from 'jquery'
import { message, notification } from 'antd'

export function uuidv4() {
  // eslint-disable-next-line func-names
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0

    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function showing100Characters(sentence) {
  let result = sentence
  let resultArray = result.split(' ')
  if (resultArray.length > 10) {
    resultArray = resultArray.slice(0, 10)
    result = `${resultArray.join(' ')}...`
  }
  return result
}

export function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

export function dummyRequest({ file, onSuccess }) {
  console.info(file)

  setTimeout(() => {
    onSuccess('ok')
  }, 0)
}

export function beforeUpload(file) {
  const isJPG = file.type === 'image/png'
  if (!isJPG) {
    message.error('You can only upload JPG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  notification.success({
    message: 'Waiting',
    description: 'Uploading started',
  })
  return isJPG && isLt2M
}

export function uploadFileToS3UsingPresignedUrl(presignedUrl, file) {
  $.ajax({
    type: 'PUT',
    url: presignedUrl,
    data: file.originFileObj,
    headers: {
      'Content-Type': file.type,
      reportProgress: true,
    },
    processData: false,
    success: data => {
      console.log('success===>>>', data)
      notification.success({
        message: 'Success',
        description: 'file has been uploaded successfully',
      })
    },
    error() {
      notification.error({
        message: 'error',
        description: 'Error occured during uploading, Please try again',
      })
    },
  })
}

function compare(a, b) {
  if (a.name_en.toLowerCase() < b.name_en.toLowerCase()) {
    return -1
  }
  if (a.name_en.toLowerCase() > b.name_en.toLowerCase()) {
    return 1
  }
  return 0
}

export function handleFilterGallery(mainGallery) {
  const numberArray = []
  const stringArray = []
  for (let i = 0; i < mainGallery.length; i++) {
    if (mainGallery[i].name_en[0] >= '0' && mainGallery[i].name_en[0] <= '9') {
      console.log(mainGallery[i].name_en[0])
      numberArray.push(mainGallery[i])
    } else {
      stringArray.push(mainGallery[i])
    }
  }

  for (let i = 1; i < numberArray.length; i++) {
    for (let j = 0; j < i; j++) {
      if (Number(numberArray[i].name_en) > Number(numberArray[j].name_en)) {
        const temp = numberArray[i]
        numberArray[i] = numberArray[j]
        numberArray[j] = temp
      }
    }
  }
  stringArray.sort(compare)
  const finalArray = numberArray.concat(stringArray)
  return finalArray
}
