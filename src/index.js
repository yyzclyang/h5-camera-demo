const inputEl = document.getElementById('camera-input');
inputEl.addEventListener(
  'change',
  () => {
    const imgFile = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      compressImage(imgFile, imageUrl).then((dataUrl) => {
        const newImage = new Image();
        newImage.src = dataUrl;
        newImage.classList.add('camera-photo');
        document.body.appendChild(newImage);
        alert('转换压缩成功');
      });
    };
    reader.readAsDataURL(imgFile);
  },
  false
);

function compressImage(file, imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');

      const width = img.width;
      const height = img.height;

      EXIF.getData(img, function () {
        const orientation = EXIF.getTag(img, 'Orientation');
        if (4 < orientation && orientation < 9) {
          cvs.width = height;
          cvs.height = width;
        } else {
          cvs.width = width;
          cvs.height = height;
        }
        switch (orientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
          case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
          default:
            break;
        }

        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const fileSize = file.size / 1024 / 1024;
        const compressRate = getCompressRate(0.25, fileSize);
        const dataUrl = cvs.toDataURL('image/jpeg', compressRate);
        resolve(dataUrl);
      });
    };
    img.src = imageUrl;
  });
}

function getCompressRate(allowMaxSize, fileSize) {
  return allowMaxSize > fileSize ? 1 : allowMaxSize / fileSize;
}
