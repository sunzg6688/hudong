/**
 * Created by sunzg on 15/7/20.
 */
var MapTileDesc = (function () {
    function MapTileDesc(x, y, canCross, type, source) {
        //0普通地图点，1起点，2终点，3npc，4建筑物...
        this.type = 0;
        this.inCloseList = false;
        this.inOpenList = false;
        this.x = x;
        this.y = y;
        this.canCross = canCross;
        this.type = type;
        this.source = source;
    }
    var __egretProto__ = MapTileDesc.prototype;
    return MapTileDesc;
})();
MapTileDesc.prototype.__class__ = "MapTileDesc";
