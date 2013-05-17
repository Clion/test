/*
* puzzleGame.js
* based on mootools
* by liangzhu
* 2013-05-13
*/

(function($) {
    var puzzleConfig = {
        sizeX: 3,
        sizeY: 3
    };

    //ȫ�ֳ���
    var Constants={
        //ÿһƬƴͼ͸���Ƚϵ�ʱ���͸����ֵ
        fadeOpacity: 0.8,
        //��ƴͼԪ�ص�ˮƽ����padding+border�ĺϼ�ֵ����������ƴͼ����������ߴ�
        puzzleContainerExtra: 42
    };

    //ͼƬ��ر���
    var puzzleImage=null,
    imageURL="",
    //ͼƬ�ϴ���ʶ��Ϊtrueʱ��ʾ������ú���ѡ��ͼƬ�󽫽�����Ϸ
    checkFlag=false,
    imageWidth=0,
    imageHeight=0;

    //ƴͼ��ر���
    var puzzleWidth=0,
    puzzleHeight=0,
    puzzleItemWidth=0,
    puzzleItemHeight=0,
    puzzleSizeX=0,
    puzzleSizeY=0,
    //ƴͼ��Ŀ 
    puzzleNumber=0,
    //������������ӿ�ʼ�������Ϸ�õĲ���
    moveStepCount=0,
    //ƴͼ�����Լ��Ƿ���ɵ���ʾ����
    puzzleNote=null,
    //����ÿһƬƴͼ����ȷ������ֵ������
    validPosArrayX=[],
    validPosArrayY=[],
    //����ÿһƬƴͼ�����飬����˳�����ȷ��ƴͼ˳����ͬ
    puzzleArray = [],
    //����ƴͼԪ�ر���
    puzzle=null,
    //���շ��ø�ƴͼ�ĸ�Ԫ�ؽڵ�
    puzzleSetElem=null;

    //��ʼ��һ������ȡƴͼ���ú�ͼƬԴ����������д���ݵ���֤*/
    var puzzleConfigSet = function() {
        //��������
        var sizeInputClassName = "size_input",
            noteWarnClassName = "note_warn",
            currentProgressClassName = "current_progress",
            validImageSuffix = ".jpg|.jpeg|.gif|.bmp|.png";

        //����ƴͼ���������������Ԫ��
        puzzleSetElem=$ ("puzzleSet");

        //ȡ�ö�ӦԪ��
        var sizeXElem = $("sizeX"),
            sizeYElem = $("sizeY"),
            sizeSetNote = $("sizeSetNote"),
            uploadBtn = $("uploadBtn"),
            fileImage = $("fileImage"),
            uploadProgress = $("uploadProgress"),
            currentProgress = uploadProgress.getFirst("." + currentProgressClassName),
            uploadNote = $("uploadNote");

        //ƴͼ�ߴ��趨���
        var puzzleSizeCheck = function() {
            var sizeX = sizeXElem.value,
                sizeY = sizeYElem.value,
                numberReg = /^\d{1,2}$/;
            if (numberReg.test(sizeX) && numberReg.test(sizeY)) {
                if (sizeX >= 2 && sizeX <= 10 && sizeY >= 2 && sizeY <= 10) {
                    puzzleConfig.sizeX = sizeX;
                    puzzleConfig.sizeY = sizeY;
                    checkFlag = true;
                } else {
                    sizeSetNote.addClass(noteWarnClassName);
                }
            } else {
                sizeSetNote.addClass(noteWarnClassName);
            }
        };

        //ͼƬ�ߴ���
        var imageCheck = function(image) {
            var minWidth = 30,
                maxWidth = 850,
                minHeight = 30;
            if (image.width >= 30 && image.width <= 850 && image.height > 30) {
                checkFlag = checkFlag && true;
            } else {
                uploadNote.addClass(noteWarnClassName);
                checkFlag = false;
            }
        };

        //ͼƬ��ʽ���
        var formatCheck = function(image) {
            var fileURL = fileImage.value.toLowerCase();
            //��ȡ�ļ���չ��
            formatSuffix = fileURL.substring(fileURL.lastIndexOf("."));
            if (formatSuffix&&validImageSuffix.contains(formatSuffix)) {
                //�������ȷ��ʽ��ͼƬ�ļ�
                checkFlag = checkFlag && true;
            } else {
                alert("���ϴ���ȷ��ʽ��ͼƬ�ļ���" + validImageSuffix + "��");
                checkFlag = false;
            }
        };

        //ƴͼ�ߴ��������¼�
        $$("." + sizeInputClassName).addEvent("focus", function() {
            sizeSetNote.removeClass(noteWarnClassName);
        });

        //��ȡѡ���ϴ���ͼƬ
        puzzleImage = new Image();
        puzzleImage.onload = function() {
            imageCheck(puzzleImage);
            if (checkFlag) {
                imageWidth = puzzleImage.width;
                //����ͼƬ�ߴ粻һ���ܱ�ƴͼ�ߴ��������������Ե�ü�
                while(imageWidth % puzzleConfig.sizeX != 0){
                    imageWidth--;
                }
                imageHeight = puzzleImage.height;
                while(imageHeight % puzzleConfig.sizeY != 0){
                    imageHeight--;
                }
                imageURL= puzzleImage.src;
                puzzleSetElem.empty();
                var containerWidth = imageWidth+Constants.puzzleContainerExtra,
                properContainerWidth = containerWidth>120?containerWidth:120;
                puzzleSetElem.getParent().setStyles({
                    width: properContainerWidth
                });
                createPuzzle(); //����ƴͼ
            }
            else{
                //�����ȡ��ͼƬ�ߴ粻���ʵĻ�������ͼƬ�ϴ�
                uploadProgress.style.display = "none";
                currentProgress.setStyle("width", 0);
                uploadBtn.style.display = "";
            }
        };
        if (typeof FileReader == "undefined") {
            //����ǲ�֧��File API�������
            fileImage.onchange = function() {
                puzzleSizeCheck();
                if (checkFlag) {
                    formatCheck();
                }
                if (checkFlag) {
                    puzzleImage.src =  fileImage.value;
                }
            };
        } else {
            //���֧��File API��������ʾ��ȡ������
            var imageReader = new FileReader();

            //����URL��blob URL�����������°�ChromeҲ֧��window.URL
            function createObjectURL(blob){
                if(window.URL){
                    return window.URL.createObjectURL(blob);
                }else if(window.webkitURL){
                    return window.webkitURL.createObjectURL(blob);
                }else{
                    return null;
                }
            }
            //��ʼ��ȡ
            imageReader.onloadstart = function() {
                puzzleSizeCheck();
                if(checkFlag){
                    formatCheck();
                }
                if (checkFlag) {
                    uploadBtn.style.display = "none";
                    uploadProgress.style.display = "";
                }
            };
            //��ȡ��
            imageReader.onprogress = function(event) {
                if (checkFlag) {
                    var percentage = 100 * parseInt(event.loaded / event.total) + "%";
                    currentProgress.setStyle("width", percentage);
                }
            };
            imageReader.onload = function(event) {
                if (checkFlag) {
                    if(Browser.ie){
                        //IE10֧��File API������Ҫʹ��value��ΪͼƬ��url
                        puzzleImage.src =  fileImage.value;
                    }else{
                        var url=createObjectURL(fileImage.files[0]);
                        puzzleImage.src = url;
                    }
                    
                }
            };
            fileImage.onchange = function() {
                imageReader.readAsDataURL(fileImage.files[0]);
            };
        }
    };

    //���ڴ���ƴͼ
    var createPuzzle = function() {
            //classNameSet��ʾ���ɵ�Ԫ�ص�class��
            var classNameSet = {
                listContainer: "puzzle_container",
                list: "puzzle_list",
                item: "puzzle_item"
            };
            //����Ԫ�ض�Ӧ�Ļ�����ʽ
            var puzzleStyle = {
                listContainer: {
                    position: "relative",
                    width: imageWidth,
                    height: imageHeight,
                    margin: "0 auto"
                },
                list: {

                },
                item: {
                    position: "absolute"
                }
            };
            //����õ�ÿһ��ƴͼ�ĳߴ�
            puzzleSizeX = puzzleConfig.sizeX;
            puzzleSizeY = puzzleConfig.sizeY;
            puzzleWidth = imageWidth;
            puzzleHeight = imageHeight;
            puzzleItemWidth = puzzleWidth / puzzleSizeX;
            puzzleItemHeight = puzzleHeight / puzzleSizeY;
            puzzleNumber = puzzleSizeX * puzzleSizeY;

            //����һ����ʱ���飬�����������˳���ƴͼ��
            var randomOrderPuzzleArray=[];

            //����Ԫ��
            puzzle = elementsCreate();
            showAnime();

            //��������ƴͼ��dom�����������ĸ���Ԫ��
            function elementsCreate() {
                var listContainer = new Element("div");
                listContainer.addClass(classNameSet.listContainer);
                listContainer.setStyles(puzzleStyle.listContainer);

                var list = new Element("ul");
                list.addClass(classNameSet.list);
                list.setStyles(puzzleStyle.list);

                //��ͨ��ѭ��������ÿһ��ƴͼ�飬������ȷ˳���������
                for(var i = 0, len = puzzleNumber; i < len; i++) {
                    var item = new Element("li");
                    //Ϊÿ��ƴͼ�����������ȷ����
                    var indexSet = i + 1;
                    item.store("puzzleIndex", indexSet);
                    item.addClass(classNameSet.item);
                    //���ӻ�����ʽ
                    item.setStyles(puzzleStyle.item);

                    //����ȷ˳�򱣴�ÿһ��ƴͼ�鵽����
                    puzzleArray.push(item);
                }

                //����һ����ȷ˳������ĸ���
                var puzzleArrayClone=puzzleArray.clone();

                //�ٴ�ͨ��ѭ��������һ�������ƴͼ���飬�������������ʾ��ҳ����
                for (i = 0, len = puzzleNumber; i < len; i++) {
                    var randomItem = puzzleArrayClone.getRandom();
                    //Ϊ�����ظ�����Ҫ�ѱ�ȡ������Ԫ���ڸ���������ɾ��
                    puzzleArrayClone.erase(randomItem);

                    //Ϊÿһ��ȡ������Ԫ�����ÿɱ��λ������
                    var posIndex = i + 1;
                    randomItem.posIndex = posIndex;

                    //��ȡȡ������Ԫ�ص���ȷ���������ڽ���������ƴͼ����ͼλ��
                    var correctIndex = randomItem.retrieve("puzzleIndex");

                    //����λ��
                    var topSet = Math.floor((posIndex - 1) / puzzleSizeX) * puzzleItemHeight,
                        leftSet = (posIndex - 1) % puzzleSizeX * puzzleItemWidth,

                        //���������ȷ�����ı���ͼλ��
                        backgroundSetX = -(correctIndex - 1) % puzzleSizeX * puzzleItemWidth,
                        backgroundSetY = -(Math.floor((correctIndex - 1) / puzzleSizeX) * puzzleItemHeight),
                        backgroundString = "url(" + imageURL + ") " + backgroundSetX + "px " + backgroundSetY + "px " + "no-repeat";

                    //��ӹؼ���ʽ
                    randomItem.setStyles({
                        width: Math.ceil(puzzleItemWidth),
                        height: Math.ceil(puzzleItemHeight),
                        background: backgroundString,
                        left: leftSet,
                        top: topSet,
                        zIndex: posIndex
                    });

                    //���ɺ����λ����������
                    validPosArrayX.push(leftSet);
                    validPosArrayY.push(topSet);

                    //�������Ԫ�ص���������
                    randomOrderPuzzleArray.push(randomItem);
                }

                //���ƴͼ�ĸ���Ԫ��
                list.adopt(randomOrderPuzzleArray);
                listContainer.adopt(list);

                return listContainer;
            }

            //Ϊƴͼ�ĳ�ʼ����������
            function showAnime(){
                //һЩ��������
                var timeSpace=50,
                //��ֱ�ƶ��ļ��
                distance=30,
                 //������
                count=0,
                timeFlag;         

                //����ƴͼ�����أ�͸������Ϊ0
                for(var i=0,len=puzzleArray.length;i<len;i++){
                    puzzleArray[i].setStyle("opacity",0);
                }

                //���µ�ҳ��dom�У�׼����ʼ����
                puzzleSetElem.grab(puzzle);

                var enterFrameHandler=function(){
                    var puzzleItem=randomOrderPuzzleArray[count++]; 
                    var endTop=parseInt(puzzleItem.getStyle("top"));
                    var startTop=endTop-distance;

                    puzzleItem.set("morph",{
                        transition: Fx.Transitions.Quad.easeOut
                    });
                    puzzleItem.morph({
                        top:[startTop,endTop],
                        opacity:Constants.fadeOpacity
                    });

                    if(count<puzzleNumber){
                        //�����һ��ƴͼ��Ķ�������������
                        if(count==puzzleNumber-1){
                            var lastMorph=puzzleItem.get("morph");
                            var showAnimeEnd=function(){
                                lastMorph.removeEvent("complete",showAnimeEnd);
                                puzzleEventBind();
                            }
                            lastMorph.addEvent("complete",showAnimeEnd);
                        }
                        timeFlag=setTimeout(enterFrameHandler,timeSpace);
                    }
                };
                timeFlag=setTimeout(enterFrameHandler,timeSpace);
            }

        };

    //ƴͼ������¼��󶨣�Ҳ����Ϸ�ĺ��Ŀ����߼�
    var puzzleEventBind=function(){
        //ƴͼ��Ϸ������صı���
        var selectedItem=null,
        //��ǰѡ�е�ƴͼλ������
        selectedIndex=0,
        //���ڱ��浱ǰ��������϶���ƴͼ��zIndexֵ
        selectedItemZIndex=0,
        //ÿһ���л�ƴͼλ�õ�ʱ�򣬶��漰��2��ƴͼ������϶������ͽ���λ�õ�����һ�飬�����������һ��
        relatedItem=null,
        //������굱ǰ��λ�ã��жϵõ���Ŀ���������������ʱ�ſ�������˵��ѡ�е�ƴͼ�Ƶ�����������ڵ�λ��
        targetIndexNew=0,
        //ͨ��new��old����������һ��Ŀ��������������һ��Ŀ������
        targetIndexOld=0,
        //�ж��Ƿ����һ��ƴͼλ���ƶ����߼�ֵ��ֻ�е�Ŀ������ֵ�иı�ʱ�����������ƴͼλ���ƶ�
        isTargetIndexChanged=false,
        //�ж����ָ���Ƿ���ƴͼ������֮��
        isInsidePuzzle=false,
        //�����ƴͼ��ĳһ�����ʱ�򣬾���ƴͼ�����ϽǶ�λ���еľ���ֵ
        disX=0,
        disY=0;

        //�����ȡ����ƴͼ�����Ͻǵ������
        var puzzlePos=puzzle.getPosition();
        var puzzlePosX=puzzlePos.x,
        puzzlePosY=puzzlePos.y;

        //��������ÿһ��Ԫ�صĶ����ٶ�
        (function(){
            for(var i=0,len=puzzleArray.length;i<len;i++){
                var puzzleItem=puzzleArray[i];
                puzzleItem.set("morph",{
                    duration:250
                });
            }
        })();

        //��������׼��
        var updateCount = (function(){
            var stepCount = $("stepCount");
            puzzleNote = stepCount.getParent();
            return function(){
                stepCount.set("text", moveStepCount);
            };
        })();

        //����¼� 
        puzzle.addEvent("mouseover",mouseOverHandler);
        puzzle.addEvent("mouseout",mouseOutHandler);
        puzzle.addEvent("mousedown",mouseDownHandler);
        puzzle.addEvent("mouseup",mouseUpHandler);

        //��꾭��
        function mouseOverHandler(event){
            var target=event.target;
            if(puzzleArray.contains(target)){
                target.setStyle("opacity",1);
            }
        }

        //����Ƴ�
        function mouseOutHandler(event){
            var target=event.target;
            if(puzzleArray.contains(target)){
                target.setStyle("opacity",Constants.fadeOpacity);
            }
        }

        //��갴��
        function mouseDownHandler(event){
            var target=event.target;
            //race("[mouseDownHandler]selectedItem ="+selectedItem);
            //�����ǰû������Ŀ��ѡ�У������ѡ�е�Ŀ����ƴͼ��
            if(!selectedItem&&puzzleArray.contains(target)){
                if(target.getStyle("opacity")<1){
                    target.setStyle("opacity",1);
                }

                //���õ�ǰѡ�е�Ŀ�꼰����
                selectedItemZIndex=target.getStyle("zIndex");
                target.setStyle("zIndex",5000);
                selectedItem=target;
                selectedIndex=target.posIndex;

                //���ó�ʼĿ������
                targetIndexNew=targetIndexOld=selectedIndex;

                //�����������ĵ��ƴͼ���ϽǶ�λ���ƫ�����
                var targetPos=target.getPosition();
                disX=event.page.x-targetPos.x;
                disY=event.page.y-targetPos.y;

                //��������ƶ����¼���������ƴͼ���������ƶ������жϵ�ǰλ��
                document.addEvent("mousemove",mouseMoveHandler);
            }
        }

        //����ɿ�
        function mouseUpHandler(event){
            //�����Ԫ�ش����϶�״̬��ȡ��
            if(selectedItem){
                selectedItem.setStyle("opacity",Constants.fadeOpacity);
                selectedItem.setStyle("zIndex",selectedItemZIndex);
                document.removeEvent("mousemove",mouseMoveHandler);

                //�ɿ�֮�󣬸���Ŀ���������϶�Ԫ�ص��������ƶ�ƴͼ��������dom�ṹ
                if(isInsidePuzzle){
                    //���Ŀ��������һ����ƴͼ
                    if(targetIndexNew!=selectedIndex){
                        puzzleItemMove(selectedItem,targetIndexNew,puzzleItemSwitch);
                    }else{
                        //��ԭ��ԭ����λ��
                        puzzleItemMove(selectedItem,selectedIndex);
                        selectedItem=null;
                        relatedItem=null;
                    }
                }else{
                    //��������ƴͼ֮��������ɿ������϶���ƴͼ��ԭ��ԭ����λ��
                    puzzleItemMove(selectedItem,selectedIndex);
                    selectedItem=null;
                    relatedItem=null;
                    targetIndexNew = targetIndexOld = selectedIndex;
                }
            }
        }

        //����ƶ�
        function mouseMoveHandler(event){
            var mouseX=event.page.x,
            mouseY=event.page.y;

            event.preventDefault();

            //����ѡ��Ԫ�ص�λ�ã��������
            selectedItem.setPosition({
                x:mouseX-disX-puzzlePosX,
                y:mouseY-disY-puzzlePosY
            })

            //������굱ǰλ���Ƿ���ƴͼ����֮�ڣ�ƴͼ��ԵҲ�����⣩
            isInsidePuzzle=(function(){
                if(mouseX<=puzzlePosX||mouseX-puzzlePosX>=puzzleWidth){
                    return false;
                }
                if(mouseY<=puzzlePosY||mouseY-puzzlePosY>=puzzleHeight){
                    return false;
                }
                return true;
            })();

            //�����굱ǰλ����ƴͼ����֮�ڣ�����Ŀ����������
            if(isInsidePuzzle){
                //race("[mouseMoveHandler]isInsidePuzzle = true");

                //����Ŀ������,xIndex��yIndex�ֱ��ʾ��ǰλ������������ź������
                var xIndex=Math.ceil((mouseX-puzzlePosX)/puzzleItemWidth),
                yIndex=Math.ceil((mouseY-puzzlePosY)/puzzleItemHeight);
                targetIndexNew=(yIndex-1)*puzzleSizeX+xIndex;

                if(targetIndexNew!=targetIndexOld){
                    isTargetIndexChanged=true;
                }
                //ֻ�е�Ŀ�����������ı�ʱ�����ƶ�ƴͼ��ʾ��
                if(isTargetIndexChanged){
                    //�����һ��Ŀ��������ƴͼ������������ƶ����������ô����Ҫ�ָ�����ƴͼ��λ�õ���ԭ���ĵط�
                    if(targetIndexOld!=selectedIndex){
                        var lastRelatedItemIndex=relatedItem.posIndex;
                        puzzleItemMove(relatedItem,lastRelatedItemIndex);
                    }

                    //�������Ԫ�أ�ȡ��ƴͼ������posIndex���ڵ�ǰ��Ŀ��������Ԫ��
                    relatedItem=puzzleArray.filter(function(item, index){
                        return item.posIndex == targetIndexNew;
                    })[0];
                    //�����һ��Ŀ�����������Ǳ����ߵ�ƴͼԭ�����ڵ�λ�ã����ƶ��µ�Ŀ��������ƴͼ�������ߵ�ƴͼ��λ��
                    if(targetIndexNew!=selectedIndex){
                        puzzleItemMove(relatedItem,selectedIndex);
                    }

                    //����Ŀ�������ı���߼�ֵ
                    isTargetIndexChanged=false;

                    //������һ��Ŀ������
                    targetIndexOld=targetIndexNew;
                }
            }else{
                //����Ƶ�ƴͼ����֮�⣬���ǻ�ԭ��һ��Ŀ��������ƴͼ
                if(targetIndexOld!=selectedIndex){
                        var lastRelatedItemIndex=relatedItem.posIndex;
                        puzzleItemMove(relatedItem,lastRelatedItemIndex);
                }
                //Ȼ��ͨ����targetIndexOld���岻�Ϸ�������ֵ0���Ϸ�����ֵӦ��1��ʼ����Ϊ�����������Դ����Ƶ�ƴͼ��������
                targetIndexOld = selectedIndex;
            }
        }

        //ÿһ��ƴͼ�����Ĺ���ʵ�ֵĺ��������Ķ�ӦԪ�ص�posIndex��������zIndex
        function puzzleItemSwitch(){

            //����Ԫ�ص�posIndex
            selectedItem.posIndex=targetIndexNew;
            relatedItem.posIndex=selectedIndex;

            //����Ԫ�ص�zIndex��ͨ��posIndex����ֵ
            selectedItem.setStyle("zIndex",selectedItem.posIndex);
            relatedItem.setStyle("zIndex",relatedItem.posIndex);

            //��������Ԫ�ص�����
            selectedItem=null;
            relatedItem=null;

            //һ�θ�����ɣ�������+1
            moveStepCount++;
            updateCount();

            //Ȼ�����ж�ƴͼ��Ϸ�Ƿ����
            clearJudgement();
        }

        //ÿһ��ƴͼ����Ϸ�е��ƶ�����
        function puzzleItemMove(moveItem,moveToIndex,endFn){
            var moveToX=validPosArrayX[moveToIndex-1],
            moveToY=validPosArrayY[moveToIndex-1],
            originZIndex=moveItem.posIndex;
            moveItemMorph=moveItem.get("morph");
            moveItemMorph.addEvent("start",moveStartHandler);
            moveItemMorph.addEvent("complete",moveEndHandler);
            moveItem.morph({
                        left:moveToX,
                        top:moveToY
            });
            function moveStartHandler(){
                moveItem.setStyle("zIndex",1000);
            }
            function moveEndHandler(){
                moveItemMorph.removeEvent("start",moveStartHandler);
                moveItemMorph.removeEvent("complete",moveEndHandler);
                moveItem.setStyle("zIndex",originZIndex);

                //��βִ�еĺ����������Ҫ�Ļ�
                if(typeOf(endFn)=="function"){
                    endFn();
                }
            }
        }

        //���ƴͼ��Ϸ���ж�����
        function clearJudgement(){
            //���puzzleArray�е�ÿһ��Ԫ�ص�puzzleIndex��posIndex�Ƿ�ȫ��һ��
            var isGameClear=puzzleArray.every(function(item, index){
                var puzzleIndex=item.retrieve("puzzleIndex");
                return item.posIndex==puzzleIndex;
            });

            if(isGameClear){
                clearShow();
            }
        }

        //ȷ�����ƴͼ��Ϸ��ִ�еĺ���
        function clearShow(){
             //��������¼�����
            puzzle.removeEvent("mouseover",mouseOverHandler);
            puzzle.removeEvent("mouseout",mouseOutHandler);
            puzzle.removeEvent("mousedown",mouseDownHandler);
            puzzle.removeEvent("mouseup",mouseUpHandler);

            var clearAnimeFlag=null,
            count=0;

            //��˳���������ƴͼ�Ķ���
            var enterFrameHandler=function(){
                var item=puzzleArray[count++];
                item.fade(1);
                if(count<puzzleNumber){
                    clearAnimeFlag=setTimeout(enterFrameHandler,50);
                }      
            };

             clearAnimeFlag=setTimeout(enterFrameHandler,50);
            
            //��Ϸ��ɺ����Ϣ~?
            puzzleNote.set('html','Congratulations ! Your final step count is <em class="step_count">'+moveStepCount+'</em>.');
        }
    }

    //����ȫ�ֱ���puzzleGame
    window.puzzleGame={};

    //��ӷ�����ȫ�ֱ���puzzleGame��
    puzzleGame.start = function() {
        puzzleConfigSet();
    };

})(document.id);

puzzleGame.start();