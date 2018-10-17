/*!
 * APopups-Gallery 1.0.5 beta
 * Author: joel.ou
 * Mail: 8019893@qq.com
 * Date: 2018年9月14日
 * License: MIT
 * Github: https://github.com/joel-ou/APopups-Gallery
 * Demo: https://joel-ou.github.io/APopupsGalleryDemo/
 */
const timerSpeed = 1000/60;

const transitions = [];

export class Transition {
    constructor(renderer){
        this.timerId;
        this.timerSpeed = timerSpeed;
        this.functions = {renderer: renderer||function(){}, end(){}};
        this.tsData;
        this.index;
    }

    /**
     * mix in a new #TransitionData
     * @param {TransitionData} data 
     * @param {Number} point 
     */
    // mix(data, delay, renderer){
    //     setTimeout(() => {
    //         if(renderer && renderer instanceof Function){
    //             data.setRenderer(renderer);
    //         }
    //         this.queuen.add(data);
    //     }, delay);
    //     return this;
    // }

    excute(data){
        this.tsData = data;
        if(data.totalFrames <= 1){
            this.run();
            return this;
        }
        if(data.isFirstFrame()){this.run();}
        this.index = transitions.push(this);
        this.timer();
        return this;
    }

    timer(){
        if(this.timerId){return true;}
        this.timerId = setInterval(()=>{
            if(!this.timerId){return;}
            this.run();
            if(this.tsData.isEnd){
                this.stop();
            }
        }, this.timerSpeed);
    }

    run(){
        let numbers = [];
        if(this.tsData.isEnd){return;}
        this.tsData.forEach(dataCell=>{
            let number = dataCell.getNumber();
            if(Number.isNaN(number)){return;}
            let numberObj = {type: dataCell.type, number};
            numbers.push(numberObj);
        });
        this.functions.renderer(numbers);
        if(this.tsData.isEnd && this.functions.end){this.functions.end();}
    }

    end(end){
        if(this.tsData <= 0 || this.tsData.isEnd){
            end();
        }
        this.functions.end = end;
        return this;
    }

    stop(){
        transitions.splice(this.index, 1);
        if(!this.timerId){return;}
        clearInterval(this.timerId);
        this.timerId = null;
        this.index = null;
    }
}

Transition.stop = function(){
    transitions.forEach(obj=>{
        obj.stop();
    });
}

export class TransitionData {
    constructor(duration){
        this.datas = [];
        this.duration = duration||0;
        this.totalFrames = (this.duration/timerSpeed)||1;
        this.frames = this.totalFrames;
        this.isEnd = false;
    }

    add(type, number){
        this.datas.push(new DataCell(type, number, this.totalFrames));
    }

    forEach(func){
        this.datas.forEach((obj, index)=>{
            func(obj, index);
        });
        this.frames--;
        if(this.frames <= 0){
            this.isEnd = true;
        }
    }

    length(){
        return this.datas.length;
    }

    isFirstFrame(){
        return this.frames === this.totalFrames;
    }
}

class DataCell {
    constructor(type, number, totalFrames){
        this.type = type;
        this.number = number;
        this.totalFrames = totalFrames;
    }

    getNumber(){
        return this.number/this.totalFrames;
    }
}