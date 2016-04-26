/*
 * Generate files and process them.
 */

import Download from 'download';

export default function () {
  /**
   * Set the default html file based on the type of banner.
   */
  switch (this.props.bannerType) {
    case 'DoubleClick':
      this.bannerSuffix = 'doubleclick';
      break;
    case 'Sizmek':
      this.bannerSuffix = 'sizmek';
      break;
    default:
      this.bannerSuffix = 'none';
  }

  const props = {
    bannerName: this.props.bannerName,
    bannerDesc: this.props.bannerDesc,
    bannerType: this.props.bannerType,
    bannerSuffix: this.bannerSuffix,
    bannerWidth: this.props.bannerWidth,
    bannerHeight: this.props.bannerHeight,
    bannerRepo: this.props.bannerRepo,
    includeOfflineEnabler: this.props.includeOfflineScripts,
  };

  /**
   * Process the html files.
   */
  const filePath = './src/index.html';
  this.fs.copy(filePath, filePath, {
    process: (content) => {
      const regEx = new RegExp('</ul>');
      const string = `  <li><a href="${props.bannerName}/" class="done">${props.bannerName}</a></li>\n      </ul>`;
      const newContent = content.toString().replace(regEx, string);
      return newContent;
    },
  });
  this.fs.copyTpl(
    this.templatePath('../../app/templates/src/300x250/_index.html'),
    this.destinationPath(`src/${this.props.bannerName}/index.html`),
    props
  );

  /**
   * Process the scss files.
   */
  this.directory(
    this.destinationPath(`src/${this.props.bannerMaster}/styles`),
    `src/${this.props.bannerName}/styles`
  );
  this.fs.copy(
    this.destinationPath(`src/${this.props.bannerMaster}/styles/base/_banner.scss`),
    this.destinationPath(`src/${this.props.bannerName}/styles/base/_banner.scss`), {
      process: (content) => {
        const regExWidth = new RegExp(/\$banner-width:\s*[0-9]*px;/);
        const regExHeight = new RegExp(/\$banner-height:\s*[0-9]*px;/);
        const newContent = content.toString()
          .replace(regExWidth, `$banner-width: ${props.bannerWidth}px;`)
          .replace(regExHeight, `$banner-height: ${props.bannerHeight}px;`);
        return newContent;
      },
    });

  /**
   * Process the js files.
   */
  this.directory(
    this.destinationPath(`src/${this.props.bannerMaster}/js`),
    `src/${this.props.bannerName}/js`
  );
  this.fs.copyTpl(
    this.templatePath('../../app/templates/src/300x250/js/_banner.js'),
    this.destinationPath(`src/${this.props.bannerName}/js/banner.js`),
    props
  );

  /**
   * Process the images.
   */
  this.directory(
    this.destinationPath(`src/${this.props.bannerMaster}/images`),
    `src/${this.props.bannerName}/images`
  );

  /**
   * Process the manifest file.
   */
  if (this.props.bannerType === 'Adform') {
    this.fs.copyTpl(
      this.templatePath('../../app/templates/src/300x250/js/_manifest.json'),
      this.destinationPath(`src/${this.props.bannerName}/manifest.json`),
      props
    );
  }
  if (this.props.bannerType === 'Flashtalking') {
    this.fs.copyTpl(
      this.templatePath('../../app/templates/src/300x250/js/_manifest.flashtalking.js'),
      this.destinationPath(`src/${this.props.bannerName}/manifest.js`),
      props
    );
  }

  /**
   * Process the offline vendor scripts.
   */
  if (this.props.includeOfflineScripts === true) {
    const getVendorScript = (vendor) => {
      const script = {
        DoubleClick: 'https://s0.2mdn.net/ads/studio/Enabler.js',
        Sizmek: 'https://secure-ds.serving-sys.com/BurstingScript/EBLoader.js',
        Adform: 'https://s1.adform.net/banners/scripts/rmb/Adform.DHTML.js',
      };
      return script[vendor];
    };
    new Download({ mode: '755' })
      .get(getVendorScript(this.props.bannerType))
      .dest('offline')
      .run();
  }
}
