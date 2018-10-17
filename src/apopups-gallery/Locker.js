/*!
 * APopups-Gallery
 * A simple locker lib for apopups
 * Author: joel.ou
 * Mail: 8019893@qq.com
 * Date: 2018年9月14日
 * License: MIT
 * Github: https://github.com/joel-ou/APopups-Gallery
 * Demo: https://joel-ou.github.io/APopupsGalleryDemo/
 */
const locked = new Set();

class Locker {
    constructor(){
    }

    lock(duration=0){
        if(this.isLocked()){
            throw new Error('the lock has been locked');
        }
        this.duration = duration;
        this.timestamp = Date.now();
        locked.add(this);
        return true;
    }

    isLocked(){
        if(!locked.has(this) || this.timestamp === 0){
            return false;
        }
        if(this.duration > 0 && (Date.now() - this.timestamp) > this.duration){
            return false;
        }
        if(this.isTimeout()){
            return false;
        }
        return true;
    }

    unlock(){
        this.lockTimestamp = 0;
        locked.delete(this);
    }

    isTimeout(){
        return this.duration === 0 && (Date.now()-this.timestamp) > 1000;
    }
}

/**
 * daemon
 */
setInterval(()=>{
    if(locked.size <= 0){
        return;
    }
    let values = locked.values();
    let next = null;
    while (next = values.next() && next != null) {
        if(next.isLocked() || !next.isTimeout()){
            continue;
        }
        next.unlock();
    }
}, 100);

function lock(duration) {
    const locker = new Locker(duration);
    locker.lock();
    return locker;
}
if(module){
    module.exports = {lock, Locker};
}else{
    // export {lock}
}
