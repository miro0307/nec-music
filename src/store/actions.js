import * as api from '../api'
import {parseLrc} from '../util';
/*
 * action 类型
 */


export const CHANGE_PLAY_LIST = 'CHANGE_PLAY_LIST'
export const CHANGE_CURR_MUSIC = 'CHANGE_CURR_MUSIC'
export const CLEAR_CURR_MUSIC = 'CLEAR_CURR_MUSIC'
export const CHOOSE_BOX = 'CHOOSE_BOX'
export const ADD_PLAY_ITEM = 'ADD_PLAY_ITEM'


/*
 * action 创建函数
 */

 //切换歌单
export function changePlayList(list) {
	return {type:CHANGE_PLAY_LIST,list}
}

//新增歌单歌曲
export function addPlayItem(item,isPlay=true) {
	return function(dispatch,getState) {
		const pl = getState().playList;
		const currIndex = pl.map(i =>i.id).indexOf(item.id)
		const sid = item.mainTrackId || item.id
		if(currIndex == -1) {
			dispatch({type:ADD_PLAY_ITEM,item})
			if(isPlay) {
				dispatch(asyncChangeCurrMusic(0,sid,true))
			}
		}else{
			if(isPlay) {
				dispatch(asyncChangeCurrMusic(currIndex,sid,true))
			}
		}
	}
}

 //切换当前歌曲
export function changeCurrMusic({index,info,url,isPlay,lrc}) {
	return {type:CHANGE_CURR_MUSIC,index,info,url,isPlay,lrc}
}

//清除当前歌曲
export function clearCurrMusic() {
	return {type:CLEAR_CURR_MUSIC}
}

//选择登录框
export function chooseBox(name,show=true) {
	return {type:CHOOSE_BOX,name,show}
}

export function asyncChangeCurrMusic(index,id,isPlay) {
	return function(dispatch,getState) {
		const state = getState();
		const info = state.playList[index]
		dispatch(changeCurrMusic({index,info,isPlay}))
		api.getMusicUrl(id).then(res => {
			if(res.data.code == 200) {
				const url = res.data.data[0].url;
				dispatch(changeCurrMusic({
					url:url
				}))
			}
			return api.getLyric(id) 
		})
		.then(res => {
			let lrc = null;
			if(res.data.code == 200) {
				lrc = res.data.lrc?parseLrc(res.data.lrc.lyric):[]
        dispatch(changeCurrMusic({
          lrc:lrc
        }))
			}
		})
		.catch(err => {
			console.log(err)
		})
	}
}