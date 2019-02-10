package com.eurochat;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.realm.react.RealmReactPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.devfd.RNGeocoder.RNGeocoderPackage;
import com.sensors.RNSensorsPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.beefe.picker.PickerViewPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.magus.fblogin.FacebookLoginPackage;
import io.realm.react.RealmReactPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.magus.fblogin.FacebookLoginPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RealmReactPackage(),
            new ImageResizerPackage(),
            new RNGeocoderPackage(),
            new RNSensorsPackage(),
            new MapsPackage(),
            new RNFetchBlobPackage(),
            new PickerViewPackage(),
            new RealmReactPackage(),
            new RNGoogleSigninPackage(),
            new VectorIconsPackage(),
            new PickerPackage(),
            new FacebookLoginPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
