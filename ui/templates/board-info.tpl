<table class="table table-bordered">
    <tbody data-bind="with: info">
        <tr><th>Address</th><td><span data-bind="text: $parent.board.address"></span></td></tr>
        <tr><th>Branch</th><td><span data-bind="text: branch"></span> (#<span data-bind="text: hash"></span>)</td></tr>
        <tr><th>Date</th><td><span data-bind="text: date"></span></td></tr>
        <tr><th>MCU</th><td><span data-bind="text: mcu"></span> at <span data-bind="text: clock"></span></td></tr>
    </tbody>
</table>
