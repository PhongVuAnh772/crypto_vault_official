import { RouteProp } from '@react-navigation/native';
import { RefObject } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';

export enum WebViewBridgeMessageType {
    invokeRnFunc = 'invokeRnFunc',
    functionResponse = 'functionResponse',
    event = 'event',
}

export interface WebViewBridgeMessage {
    type: string;
    invocationId: string;
    name: string;
    args: any[];
}

export type UseWebViewBridgeReturnType<Event> = [
    RefObject<WebView<{}>>,
    string,
    (e: WebViewMessageEvent) => void,
    (event: Event) => void,
  ];
export type TonConnectDAppBrowserParams={
    url:string,
}
export type TonConnectDAppBrowserProp = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.DAppBrowserScreen
>;